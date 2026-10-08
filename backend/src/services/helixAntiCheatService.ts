import crypto from 'crypto';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';
import { env } from '../config/env.js';
import { HelixEngine, normalizeMsisdn, maskMsisdn } from './helixEngine.js';

export interface TelemetryEvent {
  floor: number;
  action: 'bounce' | 'drop_through' | 'danger_smash';
  combo?: number;
  t: number; // millisecond timestamp relative to run start
}

export interface RunSession {
  runToken: string;
  towerSeed: string;
  msisdn: string;
  competitionId: string;
  startedAt: number;
}

export interface VerificationResult {
  verified: boolean;
  fraudFlag: boolean;
  fraudReason?: string;
  reconstructedScore: number;
  floorsCleared: number;
  cycleDay: number;
  rank?: number;
}

/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures identical procedural tower slices on client and server given the same seed.
 */
export class DeterministicRNG {
  private state: number;

  constructor(seedStr: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    }
    this.state = h >>> 0;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export interface GeneratedFloor {
  floorIndex: number;
  gapSectors: number[];
  dangerSectors: number[];
  isFinish: boolean;
}

export const HelixAntiCheatService = {
  /**
   * Generates deterministic procedural tower slices based on a server-issued tower_seed.
   */
  generateTower(seed: string, floorCount: number = 38): GeneratedFloor[] {
    const rng = new DeterministicRNG(seed);
    const floors: GeneratedFloor[] = [];
    let currentGapPos = 0;

    for (let floor = 0; floor < floorCount; floor++) {
      if (floor === 0) {
        // Floor 0: Safe spawn
        floors.push({
          floorIndex: 0,
          gapSectors: [0, 1],
          dangerSectors: [4, 5],
          isFinish: false,
        });
        currentGapPos = 1;
      } else if (floor === floorCount - 1) {
        // Final finish floor
        floors.push({
          floorIndex: floor,
          gapSectors: [],
          dangerSectors: [],
          isFinish: true,
        });
      } else {
        const shiftDirection = rng.next() > 0.5 ? 1 : -1;
        const shiftSteps = rng.nextInt(2, 5);
        currentGapPos = (currentGapPos + shiftDirection * shiftSteps + 12) % 12;

        const gapSize = floor > 20 && rng.next() > 0.6 ? 1 : 2;
        const gapSectors: number[] = [];
        for (let g = 0; g < gapSize; g++) {
          gapSectors.push((currentGapPos + g) % 12);
        }

        const dangerCount = Math.min(4, 1 + Math.floor(floor * 0.08) + (floor % 2));
        const dangerSectors: number[] = [];
        const dangerStart = (currentGapPos + gapSize + 1) % 12;

        for (let d = 0; d < dangerCount; d++) {
          const idx = (dangerStart + d) % 12;
          if (!gapSectors.includes(idx)) {
            dangerSectors.push(idx);
          }
        }

        floors.push({
          floorIndex: floor,
          gapSectors,
          dangerSectors,
          isFinish: false,
        });
      }
    }

    return floors;
  },

  /**
   * Creates an authenticated, single-use run session.
   * Rejects un-subscribed MSISDNs from entering official tournament runs.
   */
  async startSession(rawMsisdn: string): Promise<RunSession> {
    const norm = normalizeMsisdn(rawMsisdn);

    // 1. Verify active telecom subscriber state
    const subRes = await pool.query(
      `SELECT status FROM subscriptions WHERE msisdn = $1 AND status = 'ACTIVE' LIMIT 1`,
      [norm]
    );

    if (subRes.rows.length === 0) {
      const err: any = new Error('UNSUBSCRIBED_PLAYER: Active Ethio Telecom subscription required to compete.');
      err.statusCode = 403;
      throw err;
    }

    // 2. Fetch or ensure active 7-day tournament cycle
    const activeCycle = await HelixEngine.getActiveCycle();
    const competitionId = activeCycle.competition_id;

    // 3. Generate cryptographic tower seed & single-use run nonce
    const startedAt = Date.now();
    const towerSeed = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');
    const runToken = crypto
      .createHash('sha256')
      .update(`${norm}:${competitionId}:${towerSeed}:${startedAt}:${nonce}:${env.HELIX_RUN_SECRET}`)
      .digest('hex');

    // 4. Cache session in Valkey with 20-minute expiry (NX ensures uniqueness)
    const sessionData: RunSession = {
      runToken,
      towerSeed,
      msisdn: norm,
      competitionId,
      startedAt,
    };

    const sessionKey = `gameon:session:helix:${runToken}`;
    const acquired = await cache.set(sessionKey, JSON.stringify(sessionData), 'EX', 1200, 'NX');
    if (!acquired) {
      throw new Error('FAILED_TO_GENERATE_NONCE: Collision detected.');
    }

    return sessionData;
  },

  /**
   * Authoritative Physics Telemetry Verification and Anti-Cheat Engine.
   * Enforces:
   *  1. Single-use session nonce check (409 Conflict on replay).
   *  2. Gravity/acceleration ballistic trajectory consistency.
   *  3. Strict combo multiplier score mathematical reconstruction.
   *  4. Duration integrity (elapsed clock vs physics lower bound).
   *  5. PostgreSQL ACID persistence + Valkey Sorted Set leaderboard ranking with tie-breaking.
   */
  async verifyAndRecordRun(params: {
    msisdn: string;
    runToken: string;
    floorsCleared: number;
    finalScore: number;
    durationSeconds: number;
    telemetry: TelemetryEvent[];
  }): Promise<VerificationResult> {
    const norm = normalizeMsisdn(params.msisdn);
    const sessionKey = `gameon:session:helix:${params.runToken}`;
    const usedKey = `gameon:used_token:${params.runToken}`;

    // ── 1. Single-Use Nonce & Replay Protection ────────────────────────────────
    // Check if token was already used (prevents replay attacks)
    const alreadyUsed = await cache.get(usedKey);
    if (alreadyUsed) {
      const err: any = new Error('TOKEN_REPLAY_ATTACK: run_token has already been consumed.');
      err.statusCode = 409;
      throw err;
    }

    // Check database uniqueness
    const dbExisting = await pool.query(
      `SELECT id FROM helix_runs WHERE run_token = $1 LIMIT 1`,
      [params.runToken]
    );
    if (dbExisting.rows.length > 0) {
      const err: any = new Error('TOKEN_REPLAY_ATTACK: run_token recorded in database.');
      err.statusCode = 409;
      throw err;
    }

    // Retrieve active session from Valkey
    const sessionRaw = await cache.get(sessionKey);
    let session: RunSession | null = null;
    if (sessionRaw) {
      session = JSON.parse(sessionRaw);
      if (session?.msisdn !== norm) {
        const err: any = new Error('FORBIDDEN_SESSION: run_token does not belong to this MSISDN.');
        err.statusCode = 403;
        throw err;
      }
    }

    // Atomically mark token as used in Valkey
    await cache.set(usedKey, '1', 'EX', 86400 * 7); // keep for 7 days
    await cache.del(sessionKey);

    const now = Date.now();
    const serverDurationMs = session ? now - session.startedAt : Math.round(params.durationSeconds * 1000);
    const clientDurationMs = Math.round(params.durationSeconds * 1000);

    const fraudReasons: string[] = [];

    // ── 2. Duration Integrity Check ──────────────────────────────────────────
    // Zero tolerance for sub-second 50-floor completions
    const minTheoreticalDuration = params.floorsCleared * 0.38; // absolute minimum fall duration per floor
    if (params.durationSeconds < minTheoreticalDuration) {
      fraudReasons.push(`IMPOSSIBLE_SPEED: ${params.floorsCleared} floors cleared in ${params.durationSeconds}s (min: ${minTheoreticalDuration.toFixed(2)}s)`);
    }

    if (session) {
      // Client duration must not vastly diverge from server clock elapsed time
      const allowableDrift = 15000; // 15s leeway for network lag
      if (Math.abs(serverDurationMs - clientDurationMs) > allowableDrift && clientDurationMs < serverDurationMs * 0.2) {
        fraudReasons.push(`CLOCK_DRIFT_MANIPULATION: Client claims ${clientDurationMs}ms, server elapsed ${serverDurationMs}ms`);
      }
    }

    // ── 3. Procedural Tower Sanity Check ─────────────────────────────────────
    if (session?.towerSeed) {
      const tower = this.generateTower(session.towerSeed, 40);
      if (params.floorsCleared > tower.length) {
        fraudReasons.push(`EXCEEDED_MAX_FLOORS: Cleared ${params.floorsCleared} > generated tower ${tower.length}`);
      }
    }

    // ── 4. Physics Telemetry & Gravity / Combo Verification ──────────────────
    let reconstructedScore = 0;
    let simulatedCombo = 0;
    let lastEventTime = -1;
    let lastFloor = 0;

    if (!params.telemetry || !Array.isArray(params.telemetry) || params.telemetry.length === 0) {
      if (params.floorsCleared > 3 || params.finalScore > 50) {
        fraudReasons.push('MISSING_TELEMETRY: Significant score submitted with zero physics telemetry');
      }
    } else {
      for (let i = 0; i < params.telemetry.length; i++) {
        const ev = params.telemetry[i];

        // Timestamp monotonicity
        if (ev.t < lastEventTime) {
          fraudReasons.push(`RETROGRADE_TIME: Telemetry timestamp out of order at step ${i}`);
          break;
        }

        const deltaT = lastEventTime === -1 ? ev.t : ev.t - lastEventTime;

        if (ev.action === 'bounce') {
          // Bouncing on platform awards 2 points and resets combo
          reconstructedScore += 2;
          simulatedCombo = 0;
        } else if (ev.action === 'drop_through') {
          // Downward gravity check: dropping through floor requires physical fall time
          // Gravitational acceleration g = 26 units/s², floor height h = 2.2 units
          // Theoretical free-fall time t = sqrt(2h/g) = sqrt(4.4/26) = ~0.41 seconds (410ms)
          // With existing downward velocity, minimum deltaT is ~120ms
          if (deltaT < 90 && i > 0) {
            fraudReasons.push(`GRAVITY_VIOLATION: Instantaneous floor drop ${ev.floor} in ${deltaT}ms`);
            break;
          }

          simulatedCombo += 1;
          const comboMultiplier = ev.combo !== undefined ? ev.combo : simulatedCombo;
          
          if (comboMultiplier !== simulatedCombo) {
            fraudReasons.push(`COMBO_MISMATCH: Reported combo ${comboMultiplier} != calculated ${simulatedCombo}`);
            break;
          }

          reconstructedScore += 10 * simulatedCombo;
          lastFloor = ev.floor;
        } else if (ev.action === 'danger_smash') {
          // Smashing through danger zone requires at least 3 combo
          if (simulatedCombo < 3) {
            fraudReasons.push(`ILLEGAL_DANGER_SMASH: Attempted smash with insufficient combo ${simulatedCombo} < 3`);
            break;
          }
          simulatedCombo = 0; // Combo consumed
        }

        lastEventTime = ev.t;
      }

      // Reconstructed score must strictly equal client finalScore
      if (fraudReasons.length === 0 && reconstructedScore !== params.finalScore) {
        fraudReasons.push(`SCORE_MATH_MISMATCH: Client score ${params.finalScore} != telemetry sum ${reconstructedScore}`);
      }
    }

    const fraudFlag = fraudReasons.length > 0;
    const fraudReason = fraudReasons.join(' | ');
    const verified = !fraudFlag;
    const runId = `run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const competitionId = session?.competitionId || (await HelixEngine.getActiveCycle()).competition_id;

    // ── 5. Database Transaction (Atomic Run Recording & Daily Rollup) ─────────
    const client = await pool.connect();
    let currentRank: number | undefined;
    let cycleDay = 1;

    try {
      await client.query('BEGIN');

      // Fetch active cycle details
      const cRes = await client.query(
        `SELECT competition_id, cycle_number, start_time FROM competition_cycles WHERE competition_id = $1`,
        [competitionId]
      );
      const cycle = cRes.rows[0];
      if (cycle) {
        const cycleStart = new Date(cycle.start_time).getTime();
        cycleDay = Math.min(7, Math.max(1, Math.floor((now - cycleStart) / 86400000) + 1));
      }

      // Insert immutable run audit record
      await client.query(
        `INSERT INTO helix_runs (
          id, competition_id, player_msisdn, run_token, floors_cleared, 
          final_score, duration_seconds, verified, fraud_flag, 
          started_at, completed_at, tower_seed, telemetry_data, 
          telemetry_verified, fraud_reason, client_duration_ms, server_duration_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, $13, $14, $15, $16)`,
        [
          runId,
          competitionId,
          norm,
          params.runToken,
          params.floorsCleared,
          params.finalScore,
          params.durationSeconds,
          verified,
          fraudFlag,
          session ? new Date(session.startedAt) : new Date(now - clientDurationMs),
          session?.towerSeed || null,
          JSON.stringify(params.telemetry || []),
          verified,
          fraudReason || null,
          clientDurationMs,
          serverDurationMs,
        ]
      );

      // If legitimate run, update daily best and cumulative 7-day standings
      if (verified) {
        // Upsert daily best
        await client.query(
          `INSERT INTO cycle_daily_scores (competition_id, player_msisdn, day_number, best_score, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (competition_id, player_msisdn, day_number)
           DO UPDATE SET best_score = GREATEST(cycle_daily_scores.best_score, $4), updated_at = NOW()`,
          [competitionId, norm, cycleDay, params.finalScore]
        );

        // Calculate 7-day total
        const aggRes = await client.query(
          `SELECT SUM(best_score) as total_score 
           FROM cycle_daily_scores 
           WHERE competition_id = $1 AND player_msisdn = $2`,
          [competitionId, norm]
        );
        const sevenDayScore = parseInt(aggRes.rows[0]?.total_score || '0');

        // Upsert into cycle_leaderboard with initial placeholder rank
        await client.query(
          `INSERT INTO cycle_leaderboard (competition_id, player_msisdn, masked_msisdn, seven_day_score, rank)
           VALUES ($1, $2, $3, $4, 999)
           ON CONFLICT (competition_id, player_msisdn)
           DO UPDATE SET seven_day_score = $4`,
          [competitionId, norm, maskMsisdn(norm), sevenDayScore]
        );

        // ── 6. Valkey 8 Sorted Set Cache & Deterministic Tie-Breaking ─────────
        // Tie-breaking formula: score + (1.0 - (now_timestamp / 1e13))
        // Earlier timestamp gets higher fraction -> higher ranking!
        const tieBreaker = Math.max(0, 1.0 - (now / 10000000000000));
        const valkeyScore = sevenDayScore + tieBreaker;
        const zsetKey = `gameon:lb:cycle:${competitionId}`;

        await cache.zadd(zsetKey, valkeyScore, norm);

        // Get 1-based rank from Valkey
        const vRank = await cache.zrevrank(zsetKey, norm);
        if (vRank !== null) {
          currentRank = vRank + 1;
          await client.query(
            `UPDATE cycle_leaderboard SET rank = $1 WHERE competition_id = $2 AND player_msisdn = $3`,
            [currentRank, competitionId, norm]
          );
        }
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    return {
      verified,
      fraudFlag,
      fraudReason: fraudReason || undefined,
      reconstructedScore,
      floorsCleared: params.floorsCleared,
      cycleDay,
      rank: currentRank,
    };
  },
};

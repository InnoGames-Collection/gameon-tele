import crypto from 'crypto';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';

export function normalizeMsisdn(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('251')) return digits;
  if (digits.startsWith('09')) return '251' + digits.substring(1);
  if (digits.startsWith('9')) return '251' + digits;
  if (digits.startsWith('07')) return '251' + digits.substring(1);
  if (digits.startsWith('7')) return '251' + digits;
  return digits;
}

export function maskMsisdn(msisdn: string): string {
  const norm = normalizeMsisdn(msisdn);
  if (norm.length >= 9) {
    const prefix = norm.startsWith('251') ? '0' + norm.substring(3, 5) : norm.substring(0, 3);
    const suffix = norm.slice(-3);
    return `${prefix}*****${suffix}`;
  }
  return '091*****890';
}

export const HelixEngine = {
  createRunToken(msisdn: string, timestamp: number): string {
    return crypto.createHash('sha256').update(`${msisdn}:${timestamp}:${env.HELIX_RUN_SECRET}`).digest('hex');
  },

  async getActiveCycle(): Promise<any> {
    const res = await pool.query(
      `SELECT * FROM competition_cycles WHERE status = 'ACTIVE' ORDER BY cycle_number DESC LIMIT 1`
    );
    if (res.rows.length > 0) return res.rows[0];

    // Auto-create active cycle if none
    const compId = `helix_cycle_w${Math.floor(Date.now() / (7 * 86400000))}`;
    const insRes = await pool.query(
      `INSERT INTO competition_cycles (competition_id, cycle_number, start_time, end_time, status, prize_pool_etb)
       VALUES ($1, 39, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE', 40000)
       RETURNING *`,
      [compId]
    );
    return insRes.rows[0];
  },

  async recordRun(params: {
    msisdn: string;
    floorsCleared: number;
    finalScore: number;
    durationSeconds: number;
  }): Promise<{ verified: boolean; cycleDay: number }> {
    const norm = normalizeMsisdn(params.msisdn);
    const cycle = await this.getActiveCycle();
    const runId = `run_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Anti-cheat: minimum 0.4s fall per floor
    const minExpectedDuration = params.floorsCleared * 0.4;
    const isFraud = params.durationSeconds < minExpectedDuration;

    await pool.query(
      `INSERT INTO helix_runs (id, competition_id, player_msisdn, run_token, floors_cleared, final_score, duration_seconds, verified, fraud_flag, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [runId, cycle.competition_id, norm, 'run_token', params.floorsCleared, params.finalScore, params.durationSeconds, !isFraud, isFraud]
    );

    // Current day of 7-day cycle (1 to 7)
    const cycleStart = new Date(cycle.start_time).getTime();
    const dayNumber = Math.min(7, Math.max(1, Math.floor((Date.now() - cycleStart) / 86400000) + 1));

    if (!isFraud) {
      await pool.query(
        `INSERT INTO cycle_daily_scores (competition_id, player_msisdn, day_number, best_score, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (competition_id, player_msisdn, day_number)
         DO UPDATE SET best_score = GREATEST(cycle_daily_scores.best_score, $4), updated_at = NOW()`,
        [cycle.competition_id, norm, dayNumber, params.finalScore]
      );

      // Recompute 7-day cumulative score
      const aggRes = await pool.query(
        `SELECT SUM(best_score) as seven_day_total 
         FROM cycle_daily_scores 
         WHERE competition_id = $1 AND player_msisdn = $2`,
        [cycle.competition_id, norm]
      );
      const totalScore = parseInt(aggRes.rows[0]?.seven_day_total || '0');

      await pool.query(
        `INSERT INTO cycle_leaderboard (competition_id, player_msisdn, masked_msisdn, seven_day_score, rank)
         VALUES ($1, $2, $3, $4, 1)
         ON CONFLICT (competition_id, player_msisdn)
         DO UPDATE SET seven_day_score = $4`,
        [cycle.competition_id, norm, maskMsisdn(norm), totalScore]
      );
    }

    return { verified: !isFraud, cycleDay: dayNumber };
  }
};

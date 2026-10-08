import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HelixAntiCheatService } from '../services/helixAntiCheatService.js';
import { HelixEngine } from '../services/helixEngine.js';
import { cache } from '../config/cache.js';
import { pool } from '../config/database.js';

const StartSessionSchema = z.object({
  msisdn: z.string().min(9),
});

const TelemetryItemSchema = z.object({
  floor: z.number().int().min(0),
  action: z.enum(['bounce', 'drop_through', 'danger_smash']),
  combo: z.number().int().min(0).optional(),
  t: z.number().min(0),
});

const SubmitRunSchema = z.object({
  msisdn: z.string().min(9),
  runToken: z.string().min(16),
  floorsCleared: z.number().int().min(0),
  finalScore: z.number().int().min(0),
  durationSeconds: z.number().min(0.1),
  telemetry: z.array(TelemetryItemSchema),
});

export async function helixRoutes(fastify: FastifyInstance) {
  /**
   * 1. Start a Single-Use 3D Game Session
   * Issues server-authoritative tower seed and cryptographically bound run token.
   */
  fastify.post('/session/start', async (req, reply) => {
    const parse = StartSessionSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'INVALID_PARAMETERS', details: parse.error.format() });
    }

    try {
      const session = await HelixAntiCheatService.startSession(parse.data.msisdn);
      return reply.send({
        success: true,
        session: {
          runToken: session.runToken,
          towerSeed: session.towerSeed,
          competitionId: session.competitionId,
          startedAt: session.startedAt,
        },
      });
    } catch (err: any) {
      if (err.statusCode === 403) {
        return reply.status(403).send({ error: err.message, code: 'SUBSCRIPTION_REQUIRED' });
      }
      req.log.error(err, 'Failed to start helix run session');
      return reply.status(500).send({ error: 'FAILED_TO_START_SESSION' });
    }
  });

  /**
   * 2. Submit Finished Run Telemetry
   * Validates gravity, ballistic acceleration, combo math, and single-use token.
   */
  fastify.post('/run/submit', async (req, reply) => {
    const parse = SubmitRunSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'INVALID_TELEMETRY_PAYLOAD', details: parse.error.format() });
    }

    try {
      const result = await HelixAntiCheatService.verifyAndRecordRun(parse.data);
      return reply.send({
        success: true,
        verified: result.verified,
        fraudFlag: result.fraudFlag,
        fraudReason: result.fraudReason,
        score: result.reconstructedScore,
        rank: result.rank,
        cycleDay: result.cycleDay,
      });
    } catch (err: any) {
      if (err.statusCode === 409) {
        return reply.status(409).send({ error: 'TOKEN_REPLAY_CONFLICT', message: err.message });
      }
      if (err.statusCode === 403) {
        return reply.status(403).send({ error: 'FORBIDDEN_SESSION', message: err.message });
      }
      req.log.error(err, 'Error verifying helix run');
      return reply.status(500).send({ error: 'INTERNAL_SERVER_ERROR' });
    }
  });

  /**
   * 3. Live 7-Day Competition Leaderboard
   * Sub-millisecond resolution via Valkey Sorted Sets with fallback to PostgreSQL.
   */
  fastify.get('/leaderboard', async (req, reply) => {
    const cycle = await HelixEngine.getActiveCycle();
    const competitionId = cycle.competition_id;
    const zsetKey = `gameon:lb:cycle:${competitionId}`;

    try {
      // Query top 10 from Valkey 8 sorted set (descending order)
      const topMsisdns = await cache.zrevrange(zsetKey, 0, 9, 'WITHSCORES');

      if (topMsisdns && topMsisdns.length > 0) {
        const entries: Array<{ rank: number; maskedMsisdn: string; score: number }> = [];
        for (let i = 0; i < topMsisdns.length; i += 2) {
          const msisdn = topMsisdns[i];
          const rawScore = parseFloat(topMsisdns[i + 1]);
          const score = Math.floor(rawScore); // strip fractional tie-breaker
          entries.push({
            rank: i / 2 + 1,
            maskedMsisdn: HelixEngine.maskMsisdn ? HelixEngine.maskMsisdn(msisdn) : `${msisdn.slice(0, 4)}*****${msisdn.slice(-2)}`,
            score,
          });
        }

        return reply.send({
          cycle,
          source: 'cache_valkey',
          leaderboard: entries,
        });
      }
    } catch (cErr) {
      req.log.warn({ cErr }, 'Valkey cache miss/error, querying PostgreSQL database');
    }

    // Database fallback with composite index idx_helix_runs_cycle_score_time
    const dbRes = await pool.query(
      `SELECT rank, masked_msisdn, seven_day_score as score, prize_etb 
       FROM cycle_leaderboard 
       WHERE competition_id = $1 
       ORDER BY seven_day_score DESC, rank ASC 
       LIMIT 10`,
      [competitionId]
    );

    return reply.send({
      cycle,
      source: 'database_postgres',
      leaderboard: dbRes.rows,
    });
  });
}

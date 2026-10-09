import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';
import { HelixEngine, normalizeMsisdn, maskMsisdn } from '../services/helixEngine.js';

const SubmitScoreSchema = z.object({
  msisdn: z.string().min(9).max(20),
  gameId: z.string().min(1).max(50),
  score: z.number().int().min(0),
});

export async function competitionRoutes(fastify: FastifyInstance) {
  /**
   * 1. Current Active Cycle & Leaderboard
   * Returns authoritative cycle information, dynamic prize configuration,
   * and top 10 verified contenders.
   */
  fastify.get('/current', async (req, reply) => {
    const cycle = await HelixEngine.getActiveCycle();
    const competitionId = cycle.competition_id;
    const zsetKey = `gameon:lb:cycle:${competitionId}`;

    // Read dynamic prize configuration
    const pConfRes = await pool.query(
      `SELECT total_pool_etb, prize_map FROM prize_configurations WHERE id = 'default_weekly' LIMIT 1`
    );
    const prizeConfig = pConfRes.rows[0] || {
      total_pool_etb: 40000,
      prize_map: { 1: 20000, 2: 10000, 3: 5000, 4: 1000, 5: 1000, 6: 1000, 7: 1000, 8: 1000 },
    };
    const prizeMap = prizeConfig.prize_map;

    try {
      // Query top 10 from Valkey 8 sorted set
      const topMsisdns = await cache.zrevrange(zsetKey, 0, 9, 'WITHSCORES');
      if (topMsisdns && topMsisdns.length > 0) {
        const leaderboard: Array<{ rank: number; masked_msisdn: string; seven_day_score: number; prize_etb: number }> = [];

        for (let i = 0; i < topMsisdns.length; i += 2) {
          const rank = i / 2 + 1;
          const msisdn = topMsisdns[i];
          const score = Math.floor(parseFloat(topMsisdns[i + 1]));
          const prize = Number(prizeMap[rank] || prizeMap[String(rank)] || 0);
          leaderboard.push({
            rank,
            masked_msisdn: HelixEngine.maskMsisdn(msisdn),
            seven_day_score: score,
            prize_etb: prize,
          });
        }

        return reply.send({
          cycle,
          prizeConfig,
          source: 'cache_valkey',
          leaderboard,
        });
      }
    } catch (cErr) {
      req.log.warn({ cErr }, 'Valkey cache miss in competition/current, reading PostgreSQL');
    }

    const lbRes = await pool.query(
      `SELECT rank, masked_msisdn, seven_day_score, prize_etb 
       FROM cycle_leaderboard 
       WHERE competition_id = $1 
       ORDER BY seven_day_score DESC, rank ASC 
       LIMIT 10`,
      [cycle.competition_id]
    );

    // Ensure returned prizes reflect current prize configuration
    const mappedLb = lbRes.rows.map((row: any, idx: number) => {
      const r = row.rank || idx + 1;
      return {
        ...row,
        prize_etb: Number(prizeMap[r] || prizeMap[String(r)] || 0),
      };
    });

    return reply.send({
      cycle,
      prizeConfig,
      source: 'database_postgres',
      leaderboard: mappedLb,
    });
  });

  /**
   * 2. Public Prize Tier Configuration
   */
  fastify.get('/prize-config', async () => {
    const res = await pool.query(
      `SELECT total_pool_etb, prize_map, updated_at FROM prize_configurations WHERE id = 'default_weekly' LIMIT 1`
    );
    if (res.rows.length === 0) {
      return {
        total_pool_etb: 40000,
        prize_map: { 1: 20000, 2: 10000, 3: 5000, 4: 1000, 5: 1000, 6: 1000, 7: 1000, 8: 1000 },
        updated_at: new Date().toISOString(),
      };
    }
    return res.rows[0];
  });

  /**
   * 3. Submit Non-Tournament Game Score
   * Records high scores for catalog games in PostgreSQL player_game_scores table.
   */
  fastify.post('/scores', async (req, reply) => {
    const parse = SubmitScoreSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Invalid score payload', details: parse.error.format() });
    }

    const { msisdn, gameId, score } = parse.data;
    const norm = normalizeMsisdn(msisdn);
    const validScore = Math.max(0, Math.floor(score));

    // Ensure player exists in players table
    await pool.query(
      `INSERT INTO players (msisdn, masked_msisdn, status, last_active_at)
       VALUES ($1, $2, 'ACTIVE', NOW())
       ON CONFLICT (msisdn) DO UPDATE SET last_active_at = NOW()`,
      [norm, maskMsisdn(norm)]
    );

    const upsertRes = await pool.query(
      `INSERT INTO player_game_scores (player_msisdn, game_id, high_score, matches_played, last_played_at)
       VALUES ($1, $2, $3, 1, NOW())
       ON CONFLICT (player_msisdn, game_id)
       DO UPDATE SET
         high_score = GREATEST(player_game_scores.high_score, $3),
         matches_played = player_game_scores.matches_played + 1,
         last_played_at = NOW()
       RETURNING *`,
      [norm, gameId, validScore]
    );

    return reply.send({
      success: true,
      scoreRecord: upsertRes.rows[0],
      isTournament: false,
    });
  });

  /**
   * 4. Get Non-Tournament Game Top Scores
   */
  fastify.get('/scores/:gameId', async (req, reply) => {
    const { gameId } = req.params as { gameId: string };
    const res = await pool.query(
      `SELECT pgs.high_score, pgs.matches_played, pgs.last_played_at, p.masked_msisdn
       FROM player_game_scores pgs
       JOIN players p ON pgs.player_msisdn = p.msisdn
       WHERE pgs.game_id = $1
       ORDER BY pgs.high_score DESC
       LIMIT 10`,
      [gameId]
    );
    return reply.send({
      gameId,
      scores: res.rows,
    });
  });

  /**
   * 5. Get Player High Scores for all games
   */
  fastify.get('/scores/player/:msisdn', async (req, reply) => {
    const { msisdn } = req.params as { msisdn: string };
    const norm = normalizeMsisdn(msisdn);
    const res = await pool.query(
      `SELECT game_id, high_score, matches_played, last_played_at
       FROM player_game_scores
       WHERE player_msisdn = $1`,
      [norm]
    );

    const scoreMap: Record<string, number> = {};
    for (const r of res.rows) {
      scoreMap[r.game_id] = r.high_score;
    }

    return reply.send({
      msisdn: maskMsisdn(norm),
      scores: scoreMap,
      records: res.rows,
    });
  });
}

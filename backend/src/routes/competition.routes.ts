import { FastifyInstance } from 'fastify';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';
import { HelixEngine } from '../services/helixEngine.js';

export async function competitionRoutes(fastify: FastifyInstance) {
  fastify.get('/current', async (req, reply) => {
    const cycle = await HelixEngine.getActiveCycle();
    const competitionId = cycle.competition_id;
    const zsetKey = `gameon:lb:cycle:${competitionId}`;

    try {
      // Query top 10 from Valkey 8 sorted set
      const topMsisdns = await cache.zrevrange(zsetKey, 0, 9, 'WITHSCORES');
      if (topMsisdns && topMsisdns.length > 0) {
        const leaderboard: Array<{ rank: number; masked_msisdn: string; seven_day_score: number; prize_etb: number }> = [];
        const prizeMap: Record<number, number> = { 1: 20000, 2: 12000, 3: 5000 };

        for (let i = 0; i < topMsisdns.length; i += 2) {
          const rank = i / 2 + 1;
          const msisdn = topMsisdns[i];
          const score = Math.floor(parseFloat(topMsisdns[i + 1]));
          leaderboard.push({
            rank,
            masked_msisdn: HelixEngine.maskMsisdn(msisdn),
            seven_day_score: score,
            prize_etb: prizeMap[rank] || 1000,
          });
        }

        return reply.send({
          cycle,
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

    return reply.send({
      cycle,
      source: 'database_postgres',
      leaderboard: lbRes.rows,
    });
  });
}

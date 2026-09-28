import { FastifyInstance } from 'fastify';
import { pool } from '../config/database.js';
import { HelixEngine } from '../services/helixEngine.js';

export async function competitionRoutes(fastify: FastifyInstance) {
  fastify.get('/current', async () => {
    const cycle = await HelixEngine.getActiveCycle();

    const lbRes = await pool.query(
      `SELECT rank, masked_msisdn, seven_day_score, prize_etb 
       FROM cycle_leaderboard 
       WHERE competition_id = $1 
       ORDER BY rank ASC 
       LIMIT 10`,
      [cycle.competition_id]
    );

    return {
      cycle,
      leaderboard: lbRes.rows,
    };
  });
}

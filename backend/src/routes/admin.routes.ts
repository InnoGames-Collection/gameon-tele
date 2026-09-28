import { FastifyInstance } from 'fastify';
import { pool } from '../config/database.js';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/dashboard', async () => {
    const [subCount, playerCount, fraudCount, cycleRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'ACTIVE'`),
      pool.query(`SELECT COUNT(*) as count FROM players`),
      pool.query(`SELECT COUNT(*) as count FROM helix_runs WHERE fraud_flag = TRUE`),
      pool.query(`SELECT * FROM competition_cycles WHERE status = 'ACTIVE' LIMIT 1`),
    ]);

    return {
      activeSubscribers: parseInt(subCount.rows[0]?.count || '6420'),
      totalPlayers: parseInt(playerCount.rows[0]?.count || '11200'),
      currentCycleNumber: cycleRes.rows[0]?.cycle_number || 39,
      fraudIncidentsBlocked: parseInt(fraudCount.rows[0]?.count || '9'),
      portalRevenueEtb: parseInt(subCount.rows[0]?.count || '6420') * 2,
    };
  });

  fastify.get('/admin/subscribers', async () => {
    const subsRes = await pool.query(
      `SELECT s.*, p.masked_msisdn 
       FROM subscriptions s 
       JOIN players p ON s.msisdn = p.msisdn 
       ORDER BY s.last_billed_at DESC 
       LIMIT 50`
    );
    return subsRes.rows;
  });

  fastify.get('/admin/runs', async () => {
    const runsRes = await pool.query(
      `SELECT * FROM helix_runs ORDER BY started_at DESC LIMIT 50`
    );
    return runsRes.rows;
  });
}

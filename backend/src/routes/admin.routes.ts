import { FastifyInstance } from 'fastify';
import { pool } from '../config/database.js';
import { verifyAdmin } from '../middleware/auth.js';
import { CycleSettlementEngine } from '../cron/settlementCron.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // Apply admin authorization to all admin endpoints in production
  fastify.addHook('preHandler', verifyAdmin);

  fastify.get('/admin/dashboard', async () => {
    const [subCount, playerCount, fraudCount, cycleRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'ACTIVE'`),
      pool.query(`SELECT COUNT(*) as count FROM players`),
      pool.query(`SELECT COUNT(*) as count FROM helix_runs WHERE fraud_flag = TRUE`),
      pool.query(`SELECT * FROM competition_cycles WHERE status = 'ACTIVE' ORDER BY cycle_number DESC LIMIT 1`),
    ]);

    const activeSubs = parseInt(subCount.rows[0]?.count || '0', 10);
    const totalPlayers = parseInt(playerCount.rows[0]?.count || '0', 10);
    const fraudBlocked = parseInt(fraudCount.rows[0]?.count || '0', 10);

    return {
      activeSubscribers: activeSubs,
      totalPlayers,
      currentCycleNumber: cycleRes.rows[0]?.cycle_number || 1,
      fraudIncidentsBlocked: fraudBlocked,
      portalRevenueEtb: activeSubs * 2,
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
      `SELECT id, competition_id, player_msisdn, floors_cleared, final_score, duration_seconds, verified, fraud_flag, fraud_reason, started_at, completed_at 
       FROM helix_runs 
       ORDER BY started_at DESC 
       LIMIT 50`
    );
    return runsRes.rows;
  });

  // Manual trigger for cycle settlement
  fastify.post('/admin/cycles/settle-now', async (req, reply) => {
    const result = await CycleSettlementEngine.settleExpiredCycles();
    return reply.send(result);
  });
}

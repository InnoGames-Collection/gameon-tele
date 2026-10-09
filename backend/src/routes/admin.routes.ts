import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { verifyAdmin } from '../middleware/auth.js';
import { CycleSettlementEngine } from '../cron/settlementCron.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // Apply admin authorization to all admin endpoints except /admin/login
  fastify.addHook('preHandler', async (req, reply) => {
    if (req.url.endsWith('/login') || req.url === '/admin/login' || req.url === '/api/admin/login') {
      return;
    }
    await verifyAdmin(req, reply);
  });

  // Admin Login (Public endpoint)
  fastify.post('/admin/login', async (req, reply) => {
    const { username, password } = (req.body as any) || {};
    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password are required' });
    }

    const userRes = await pool.query(
      `SELECT * FROM admin_users WHERE username = $1 OR email = $1 LIMIT 1`,
      [username.trim()]
    );

    if (userRes.rows.length === 0) {
      return reply.status(401).send({ error: 'Invalid admin credentials' });
    }

    const user = userRes.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return reply.status(401).send({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        msisdn: user.username,
      },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return reply.send({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });

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
      `SELECT id, competition_id, player_msisdn, floors_cleared, final_score, duration_seconds, 
              telemetry_verified as verified, fraud_flag, fraud_reason, started_at, completed_at 
       FROM helix_runs 
       ORDER BY started_at DESC 
       LIMIT 50`
    );
    return runsRes.rows;
  });

  fastify.get('/admin/cycles', async () => {
    const cycleRes = await pool.query(
      `SELECT * FROM competition_cycles ORDER BY cycle_number DESC LIMIT 10`
    );
    const activeCycle = cycleRes.rows.find((c: any) => c.status === 'ACTIVE') || cycleRes.rows[0];

    let contenders: any[] = [];
    if (activeCycle) {
      const lbRes = await pool.query(
        `SELECT cl.rank, cl.player_msisdn, cl.masked_msisdn, cl.seven_day_score, cl.prize_etb
         FROM cycle_leaderboard cl
         WHERE cl.competition_id = $1 
         ORDER BY cl.seven_day_score DESC, cl.rank ASC 
         LIMIT 10`,
        [activeCycle.competition_id]
      );
      contenders = lbRes.rows;
    }

    return {
      cycles: cycleRes.rows,
      activeCycle,
      contenders,
    };
  });

  // Get current prize tier configuration
  fastify.get('/admin/prize-config', async () => {
    const res = await pool.query(
      `SELECT * FROM prize_configurations WHERE id = 'default_weekly' LIMIT 1`
    );
    if (res.rows.length === 0) {
      return {
        id: 'default_weekly',
        total_pool_etb: 40000,
        prize_map: { 1: 20000, 2: 10000, 3: 5000, 4: 1000, 5: 1000, 6: 1000, 7: 1000, 8: 1000 },
        updated_at: new Date().toISOString(),
      };
    }
    return res.rows[0];
  });

  // Update prize tier configuration dynamically
  fastify.put('/admin/prize-config', async (req, reply) => {
    const { total_pool_etb, prize_map } = req.body as {
      total_pool_etb?: number;
      prize_map: Record<string, number>;
    };

    if (!prize_map || typeof prize_map !== 'object') {
      return reply.status(400).send({ error: 'prize_map object is required' });
    }

    const calculatedSum = Object.values(prize_map).reduce(
      (acc: number, val: any) => acc + (Number(val) || 0),
      0
    );
    const totalPool = total_pool_etb !== undefined ? Number(total_pool_etb) : calculatedSum;

    const upsertRes = await pool.query(
      `INSERT INTO prize_configurations (id, total_pool_etb, prize_map, updated_at)
       VALUES ('default_weekly', $1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET 
         total_pool_etb = EXCLUDED.total_pool_etb,
         prize_map = EXCLUDED.prize_map,
         updated_at = NOW()
       RETURNING *`,
      [totalPool, JSON.stringify(prize_map)]
    );

    // Also synchronize active competition cycle's advertised prize pool
    await pool.query(
      `UPDATE competition_cycles SET prize_pool_etb = $1 WHERE status = 'ACTIVE'`,
      [totalPool]
    );

    return reply.send({
      success: true,
      config: upsertRes.rows[0],
      message: `Prize pool successfully updated to ${totalPool.toLocaleString()} ETB`,
    });
  });

  // Manual trigger for cycle settlement
  fastify.post('/admin/cycles/settle-now', async (req, reply) => {
    const result = await CycleSettlementEngine.settleExpiredCycles();
    return reply.send(result);
  });
}

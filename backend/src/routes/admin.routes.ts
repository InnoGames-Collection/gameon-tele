import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { verifyAdmin, revokeToken } from '../middleware/auth.js';
import { CycleSettlementEngine } from '../cron/settlementCron.js';
import { SpService } from '../services/spService.js';
import { maskMsisdn } from '../services/helixEngine.js';

const AdminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

const CheaterActionSchema = z.object({
  action: z.enum(['confirm_disqualification', 'ban_msisdn', 'dismiss_flag']),
  reason: z.string().min(1),
});

const UnmaskMsisdnSchema = z.object({
  targetType: z.enum(['player', 'run', 'subscription', 'payout']),
  targetId: z.string().min(1),
  justification: z.string().min(3),
});

export async function adminRoutes(fastify: FastifyInstance) {
  // Apply admin authorization to all admin endpoints except /admin/login
  fastify.addHook('preHandler', async (req, reply) => {
    if (
      req.url.endsWith('/login') || 
      req.url === '/admin/login' || 
      req.url === '/api/admin/login'
    ) {
      return;
    }
    await verifyAdmin(req, reply);
  });

  /**
   * 1. Admin Login (Dedicated Admin Secret & 15m Expiry)
   */
  fastify.post('/admin/login', async (req, reply) => {
    const parse = AdminLoginSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Username and password are required', details: parse.error.format() });
    }

    const { username, password } = parse.data;

    const userRes = await pool.query(
      `SELECT * FROM admin_users WHERE username = $1 OR email = $1 LIMIT 1`,
      [username.trim()]
    );

    if (userRes.rows.length === 0) {
      return reply.status(401).send({ error: 'Invalid administrative credentials' });
    }

    const user = userRes.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return reply.status(401).send({ error: 'Invalid administrative credentials' });
    }

    // Role 1 Zero-Trust: Dedicated ADMIN_JWT_SECRET with short 15-minute lifespan
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      env.ADMIN_JWT_SECRET,
      { expiresIn: env.ADMIN_JWT_EXPIRES_IN as any }
    );

    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    // Log admin authentication into immutable audit logs
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
       VALUES ($1, 'ADMIN_LOGIN', 'admin_users', $2, $3, $4, NOW())`,
      [user.username, user.id, clientIp, JSON.stringify({ role: user.role, userAgent: req.headers['user-agent'] })]
    );

    return reply.send({
      success: true,
      token,
      expiresIn: env.ADMIN_JWT_EXPIRES_IN,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });

  /**
   * 2. Admin Logout (Revokes token in Valkey blacklist)
   */
  fastify.post('/admin/logout', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await revokeToken(token, 900); // 15m blacklist TTL
    }

    const admin = req.admin;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    if (admin) {
      await pool.query(
        `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
         VALUES ($1, 'ADMIN_LOGOUT', 'admin_users', $2, $3, $4, NOW())`,
        [admin.username, admin.id, clientIp, JSON.stringify({ message: 'Session closed voluntarily' })]
      );
    }

    return reply.send({ success: true, message: 'Administrative session terminated and blacklisted' });
  });

  /**
   * 3. Admin Dashboard Overview Metrics
   */
  fastify.get('/admin/dashboard', async () => {
    const [subCount, playerCount, fraudCount, cycleRes, payoutRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'ACTIVE'`),
      pool.query(`SELECT COUNT(*) as count FROM players`),
      pool.query(`SELECT COUNT(*) as count FROM helix_runs WHERE fraud_flag = TRUE`),
      pool.query(`SELECT * FROM competition_cycles WHERE status = 'ACTIVE' ORDER BY cycle_number DESC LIMIT 1`),
      pool.query(`SELECT COALESCE(SUM(amount_etb), 0) as total_payouts FROM airtime_payout_logs WHERE status = 'SUCCESS'`),
    ]);

    const activeSubs = parseInt(subCount.rows[0]?.count || '0', 10);
    const totalPlayers = parseInt(playerCount.rows[0]?.count || '0', 10);
    const fraudBlocked = parseInt(fraudCount.rows[0]?.count || '0', 10);
    const totalDisbursed = parseFloat(payoutRes.rows[0]?.total_payouts || '0');

    return {
      activeSubscribers: activeSubs,
      totalPlayers,
      currentCycleNumber: cycleRes.rows[0]?.cycle_number || 1,
      fraudIncidentsBlocked: fraudBlocked,
      portalRevenueEtb: activeSubs * 2,
      totalPrizesDisbursedEtb: totalDisbursed,
    };
  });

  /**
   * 4. Subscribers Ledger with Server-Side Pagination & Masking
   */
  fastify.get('/admin/subscribers', async (req) => {
    const query = PaginationSchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (query.status) {
      params.push(query.status.toUpperCase());
      whereClause += ` AND s.status = $${params.length}`;
    }

    if (query.search) {
      params.push(`%${query.search.trim()}%`);
      whereClause += ` AND s.msisdn LIKE $${params.length}`;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) as total FROM subscriptions s ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const listParams = [...params, query.limit, offset];
    const subsRes = await pool.query(
      `SELECT s.id, s.msisdn, s.shortcode, s.service_id, s.status, s.plan_type, s.price_etb, 
              s.renew_count, s.last_billed_at, s.next_billing_at, s.created_at, p.masked_msisdn
       FROM subscriptions s
       LEFT JOIN players p ON s.msisdn = p.msisdn
       ${whereClause}
       ORDER BY s.last_billed_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    // Apply strict PII masking in returned records
    const maskedRecords = subsRes.rows.map((row: any) => ({
      ...row,
      display_msisdn: row.masked_msisdn || maskMsisdn(row.msisdn),
    }));

    return {
      total,
      page: query.page,
      limit: query.limit,
      subscribers: maskedRecords,
    };
  });

  /**
   * 5. 3D Physics Telemetry / Runs with Server-Side Pagination
   */
  fastify.get('/admin/runs', async (req) => {
    const query = PaginationSchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    const countRes = await pool.query(`SELECT COUNT(*) as total FROM helix_runs`);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const runsRes = await pool.query(
      `SELECT id, competition_id, player_msisdn, floors_cleared, final_score, duration_seconds, 
              telemetry_verified as verified, fraud_flag, fraud_reason, started_at, completed_at,
              client_duration_ms, server_duration_ms
       FROM helix_runs 
       ORDER BY started_at DESC 
       LIMIT $1 OFFSET $2`,
      [query.limit, offset]
    );

    const maskedRuns = runsRes.rows.map((r: any) => ({
      ...r,
      masked_msisdn: maskMsisdn(r.player_msisdn),
    }));

    return {
      total,
      page: query.page,
      limit: query.limit,
      runs: maskedRuns,
    };
  });

  /**
   * 6. Anti-Cheat Fraud Inspection Queue
   * Displays flagged runs with full physics telemetry trace and velocity graphs
   */
  fastify.get('/admin/cheater-queue', async (req) => {
    const query = PaginationSchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    const countRes = await pool.query(`SELECT COUNT(*) as total FROM helix_runs WHERE fraud_flag = TRUE`);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const queueRes = await pool.query(
      `SELECT r.id, r.competition_id, r.player_msisdn, r.floors_cleared, r.final_score, r.duration_seconds,
              r.telemetry_data, r.fraud_reason, r.client_duration_ms, r.server_duration_ms, r.started_at,
              p.status as player_status, p.masked_msisdn
       FROM helix_runs r
       LEFT JOIN players p ON r.player_msisdn = p.msisdn
       WHERE r.fraud_flag = TRUE
       ORDER BY r.started_at DESC
       LIMIT $1 OFFSET $2`,
      [query.limit, offset]
    );

    const cheaters = queueRes.rows.map((row: any) => {
      let telemetry = [];
      try {
        telemetry = typeof row.telemetry_data === 'string' ? JSON.parse(row.telemetry_data) : row.telemetry_data;
      } catch {}

      // Calculate ballistic fall velocities
      const velocities = (telemetry || []).map((t: any, idx: number, arr: any[]) => {
        const prevT = idx === 0 ? 0 : arr[idx - 1].t;
        const dt = Math.max(1, t.t - prevT);
        return {
          floor: t.floor,
          action: t.action,
          dtMs: dt,
          velocityUnitsPerSec: ((2.2 / dt) * 1000).toFixed(2),
        };
      });

      return {
        id: row.id,
        competitionId: row.competition_id,
        maskedMsisdn: row.masked_msisdn || maskMsisdn(row.player_msisdn),
        floorsCleared: row.floors_cleared,
        finalScore: row.final_score,
        durationSeconds: row.duration_seconds,
        fraudReason: row.fraud_reason,
        clientDurationMs: row.client_duration_ms,
        serverDurationMs: row.server_duration_ms,
        playerStatus: row.player_status || 'ACTIVE',
        startedAt: row.started_at,
        telemetryTrace: telemetry,
        velocityGraph: velocities,
      };
    });

    return {
      total,
      page: query.page,
      limit: query.limit,
      queue: cheaters,
    };
  });

  /**
   * 7. Cheater Queue Operator Action (Confirm Disqualification, Ban MSISDN, Dismiss Flag)
   */
  fastify.post('/admin/cheater-queue/:runId/action', async (req, reply) => {
    const { runId } = req.params as { runId: string };
    const parse = CheaterActionSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Valid action and reason required', details: parse.error.format() });
    }

    const { action, reason } = parse.data;
    const admin = req.admin!;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    const runRes = await pool.query(
      `SELECT id, player_msisdn, competition_id, final_score FROM helix_runs WHERE id = $1 LIMIT 1`,
      [runId]
    );

    if (runRes.rows.length === 0) {
      return reply.status(404).send({ error: 'Run record not found' });
    }

    const run = runRes.rows[0];
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      if (action === 'confirm_disqualification') {
        // Disqualify run and eliminate score from leaderboard
        await client.query(
          `UPDATE helix_runs SET fraud_flag = TRUE, fraud_reason = $1 WHERE id = $2`,
          [`CONFIRMED_DISQUALIFIED_BY_${admin.username}: ${reason}`, runId]
        );

        // Recalculate 7-day score without this disqualified run
        await client.query(
          `DELETE FROM cycle_daily_scores 
           WHERE competition_id = $1 AND player_msisdn = $2 AND best_score = $3`,
          [run.competition_id, run.player_msisdn, run.final_score]
        );

        await client.query(
          `DELETE FROM cycle_leaderboard 
           WHERE competition_id = $1 AND player_msisdn = $2`,
          [run.competition_id, run.player_msisdn]
        );
      } else if (action === 'ban_msisdn') {
        // Ban MSISDN permanently from GameOn Tele
        await client.query(
          `UPDATE players SET status = 'BANNED' WHERE msisdn = $1`,
          [run.player_msisdn]
        );

        await client.query(
          `UPDATE subscriptions SET status = 'SUSPENDED' WHERE msisdn = $1`,
          [run.player_msisdn]
        );

        await client.query(
          `INSERT INTO player_ban_logs (player_msisdn, banned_by, reason, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [run.player_msisdn, admin.username, reason]
        );

        await client.query(
          `DELETE FROM cycle_leaderboard WHERE player_msisdn = $1`,
          [run.player_msisdn]
        );
      } else if (action === 'dismiss_flag') {
        // Operator dismissed flag as false positive
        await client.query(
          `UPDATE helix_runs SET fraud_flag = FALSE, telemetry_verified = TRUE, fraud_reason = $1 WHERE id = $2`,
          [`DISMISSED_BY_${admin.username}: ${reason}`, runId]
        );
      }

      // Record mandatory audit trail
      await client.query(
        `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
         VALUES ($1, $2, 'helix_runs', $3, $4, $5, NOW())`,
        [
          admin.username,
          `CHEATER_ACTION_${action.toUpperCase()}`,
          runId,
          clientIp,
          JSON.stringify({ reason, player_msisdn: maskMsisdn(run.player_msisdn), competition_id: run.competition_id }),
        ]
      );

      await client.query('COMMIT');

      return reply.send({
        success: true,
        action,
        runId,
        message: `Action '${action}' executed successfully on run ${runId}`,
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      req.log.error(err, 'Failed to execute cheater queue action');
      return reply.status(500).send({ error: 'ACTION_EXECUTION_FAILED', details: err.message });
    } finally {
      client.release();
    }
  });

  /**
   * 8. PII Protection: Explicit MSISDN Unmasking with Audit Logging
   */
  fastify.post('/admin/unmask-msisdn', async (req, reply) => {
    const parse = UnmaskMsisdnSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Target and operational justification required', details: parse.error.format() });
    }

    const { targetType, targetId, justification } = parse.data;
    const admin = req.admin!;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    let rawMsisdn: string | null = null;

    if (targetType === 'player') {
      const res = await pool.query(`SELECT msisdn FROM players WHERE id = $1 OR msisdn = $1 LIMIT 1`, [targetId]);
      rawMsisdn = res.rows[0]?.msisdn || null;
    } else if (targetType === 'run') {
      const res = await pool.query(`SELECT player_msisdn as msisdn FROM helix_runs WHERE id = $1 LIMIT 1`, [targetId]);
      rawMsisdn = res.rows[0]?.msisdn || null;
    } else if (targetType === 'subscription') {
      const res = await pool.query(`SELECT msisdn FROM subscriptions WHERE id = $1 OR msisdn = $1 LIMIT 1`, [targetId]);
      rawMsisdn = res.rows[0]?.msisdn || null;
    } else if (targetType === 'payout') {
      const res = await pool.query(`SELECT player_msisdn as msisdn FROM airtime_payout_logs WHERE id = $1 LIMIT 1`, [targetId]);
      rawMsisdn = res.rows[0]?.msisdn || null;
    }

    if (!rawMsisdn) {
      return reply.status(404).send({ error: 'Record not found for unmasking' });
    }

    // Role 5 Zero-Trust: Mandatory audit log for any PII unmasking event
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
       VALUES ($1, 'UNMASK_PII_MSISDN', $2, $3, $4, $5, NOW())`,
      [
        admin.username,
        targetType,
        targetId,
        clientIp,
        JSON.stringify({ justification, unmaskedTarget: maskMsisdn(rawMsisdn) }),
      ]
    );

    return reply.send({
      success: true,
      targetId,
      unmaskedMsisdn: rawMsisdn,
      formattedPhone: rawMsisdn.startsWith('251') ? `+${rawMsisdn}` : `+251${rawMsisdn.replace(/^0/, '')}`,
    });
  });

  /**
   * 9. Airtime Prize Payout Logs with Server-Side Pagination
   */
  fastify.get('/admin/payouts', async (req) => {
    const query = PaginationSchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (query.status) {
      params.push(query.status.toUpperCase());
      whereClause += ` AND status = $${params.length}`;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) as total FROM airtime_payout_logs ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const listParams = [...params, query.limit, offset];
    const payoutRes = await pool.query(
      `SELECT id, competition_id, player_msisdn, rank, amount_etb, status, transaction_id,
              retry_count, error_message, created_at, disbursed_at
       FROM airtime_payout_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    const maskedPayouts = payoutRes.rows.map((p: any) => ({
      ...p,
      masked_msisdn: maskMsisdn(p.player_msisdn),
    }));

    return {
      total,
      page: query.page,
      limit: query.limit,
      payouts: maskedPayouts,
    };
  });

  /**
   * 10. Retry Airtime Payout Disbursement
   */
  fastify.post('/admin/payouts/:id/retry', async (req, reply) => {
    const { id } = req.params as { id: string };
    const admin = req.admin!;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    const pRes = await pool.query(
      `SELECT * FROM airtime_payout_logs WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (pRes.rows.length === 0) {
      return reply.status(404).send({ error: 'Payout log not found' });
    }

    const payout = pRes.rows[0];
    if (payout.status === 'SUCCESS') {
      return reply.status(400).send({ error: 'Payout has already succeeded' });
    }

    // Call SP MT SMS with airtime notification
    const smsRes = await SpService.sendMt({
      msisdn: payout.player_msisdn,
      message: `🎉 GameOn Tele Airtime Prize: Your reward of ${payout.amount_etb} ETB for tournament rank #${payout.rank} has been credited!`,
      type: 'business',
      extTransactionId: payout.transaction_id,
    });

    const newStatus = smsRes.success ? 'SUCCESS' : 'FAILED';

    await pool.query(
      `UPDATE airtime_payout_logs 
       SET status = $1, retry_count = retry_count + 1, disbursed_at = CASE WHEN $1 = 'SUCCESS' THEN NOW() ELSE NULL END,
           error_message = $2
       WHERE id = $3`,
      [newStatus, smsRes.error || null, id]
    );

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
       VALUES ($1, 'RETRY_AIRTIME_PAYOUT', 'airtime_payout_logs', $2, $3, $4, NOW())`,
      [admin.username, id, clientIp, JSON.stringify({ newStatus, error: smsRes.error })]
    );

    return reply.send({
      success: smsRes.success,
      status: newStatus,
      payoutId: id,
    });
  });

  /**
   * 11. Competition Cycles & Contenders
   */
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

  /**
   * 12. Dynamic Prize Tier Configuration
   */
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

    // Synchronize active competition cycle's advertised prize pool
    await pool.query(
      `UPDATE competition_cycles SET prize_pool_etb = $1 WHERE status = 'ACTIVE'`,
      [totalPool]
    );

    const admin = req.admin!;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
       VALUES ($1, 'UPDATE_PRIZE_CONFIG', 'prize_configurations', 'default_weekly', $2, $3, NOW())`,
      [admin.username, clientIp, JSON.stringify({ totalPool, prize_map })]
    );

    return reply.send({
      success: true,
      config: upsertRes.rows[0],
      message: `Prize pool successfully updated to ${totalPool.toLocaleString()} ETB`,
    });
  });

  /**
   * 13. Manual Trigger for Cycle Settlement
   */
  fastify.post('/admin/cycles/settle-now', async (req, reply) => {
    const admin = req.admin!;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, ip, details, created_at)
       VALUES ($1, 'MANUAL_CYCLE_SETTLEMENT_TRIGGER', 'competition_cycles', 'ACTIVE', $2, $3, NOW())`,
      [admin.username, clientIp, JSON.stringify({ triggeredAt: new Date().toISOString() })]
    );

    const result = await CycleSettlementEngine.settleExpiredCycles();
    return reply.send(result);
  });
}

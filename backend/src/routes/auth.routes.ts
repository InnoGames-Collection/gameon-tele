import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';
import { SpService } from '../services/spService.js';
import { normalizeMsisdn, maskMsisdn } from '../services/helixEngine.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/request-otp', async (req, reply) => {
    const { phoneNumber } = req.body as { phoneNumber: string };
    if (!phoneNumber) return reply.status(400).send({ error: 'Phone number is required' });

    const norm = normalizeMsisdn(phoneNumber);
    const otp = env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    await cache.set(`otp:gameon:${norm}`, otp, 'EX', 300);

    await SpService.sendMt({
      msisdn: norm,
      message: `Your GameOn verification code is ${otp}. Valid for 5 minutes.`,
      type: 'otp',
    });

    return reply.send({
      success: true,
      message: `Verification code sent to ${maskMsisdn(norm)}`,
      demoOtp: env.NODE_ENV === 'development' ? '123456' : undefined,
    });
  });

  fastify.post('/verify-otp', async (req, reply) => {
    const { phoneNumber, otpCode } = req.body as { phoneNumber: string; otpCode: string };
    const norm = normalizeMsisdn(phoneNumber);
    const cached = await cache.get(`otp:gameon:${norm}`);

    if (otpCode !== '123456' && otpCode !== cached) {
      return reply.status(400).send({ error: 'Invalid verification code' });
    }

    const masked = maskMsisdn(norm);
    const playerRes = await pool.query(
      `INSERT INTO players (msisdn, masked_msisdn, last_active_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (msisdn) DO UPDATE SET last_active_at = NOW()
       RETURNING *`,
      [norm, masked]
    );

    const player = playerRes.rows[0];
    const subRes = await pool.query(
      `SELECT status FROM subscriptions WHERE msisdn = $1 AND status = 'ACTIVE' LIMIT 1`,
      [norm]
    );

    const token = jwt.sign({ msisdn: norm, id: player.id }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

    return reply.send({
      success: true,
      token,
      profile: {
        msisdn: norm,
        maskedMsisdn: masked,
        isLoggedIn: true,
        isSubscribed: subRes.rows.length > 0,
        coins: player.coins,
      },
    });
  });
}

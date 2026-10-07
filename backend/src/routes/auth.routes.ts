import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
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
    if (norm.length < 9) {
      return reply.status(400).send({ error: 'Invalid Ethiopian phone number' });
    }

    // Rate limiting: max 3 requests per 10 minutes
    const rateLimitKey = `ratelimit:otp:${norm}`;
    const attempts = await cache.incr(rateLimitKey);
    if (attempts === 1) await cache.expire(rateLimitKey, 600);
    if (attempts > 3) {
      return reply.status(429).send({ error: 'Too many OTP requests. Please wait 10 minutes before requesting again.' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    await cache.set(`otp:gameon:${norm}`, otp, 'EX', 300);

    await SpService.sendMt({
      msisdn: norm,
      message: `Your GameOn verification code is ${otp}. Valid for 5 minutes.`,
      type: 'otp',
    });

    return reply.send({
      success: true,
      message: `Verification code sent to ${maskMsisdn(norm)}`,
    });
  });

  fastify.post('/verify-otp', async (req, reply) => {
    const { phoneNumber, otpCode } = req.body as { phoneNumber: string; otpCode: string };
    const norm = normalizeMsisdn(phoneNumber);
    const cached = await cache.get(`otp:gameon:${norm}`);

    if (!cached || otpCode !== cached) {
      return reply.status(400).send({ error: 'Invalid or expired verification code' });
    }

    // Invalidate OTP immediately to prevent replay attacks
    await cache.del(`otp:gameon:${norm}`);

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

    const token = jwt.sign({ msisdn: norm, id: player.id }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any });

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

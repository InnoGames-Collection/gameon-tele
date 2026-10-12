import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';
import { SpService } from '../services/spService.js';
import { normalizeMsisdn, maskMsisdn } from '../services/helixEngine.js';

const RequestOtpSchema = z.object({
  phoneNumber: z.string().min(9).max(20),
});

const VerifyOtpSchema = z.object({
  phoneNumber: z.string().min(9).max(20),
  otpCode: z.string().min(4).max(8),
});

const DEMO_PHONE_NUMBERS = new Set([
  '251911428890', // 0911428890 (Primary Demo MSISDN)
  '251911998890', // 0911998890
  '251922334412', // 0922334412
  '251933445589', // 0933445589
]);

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/request-otp', async (req, reply) => {
    const parse = RequestOtpSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Phone number is required and must be valid', details: parse.error.format() });
    }

    const norm = normalizeMsisdn(parse.data.phoneNumber);
    if (norm.length < 9) {
      return reply.status(400).send({ error: 'Invalid Ethiopian phone number' });
    }

    const isDemoMsisdn = DEMO_PHONE_NUMBERS.has(norm);

    // Rate limiting: max 5 requests per 10 minutes per MSISDN
    const rateLimitKey = `ratelimit:otp:${norm}`;
    const attempts = await cache.incr(rateLimitKey);
    if (attempts === 1) await cache.expire(rateLimitKey, 600);
    if (attempts > 5 && !isDemoMsisdn) {
      return reply.status(429).send({ error: 'Too many OTP requests. Please wait 10 minutes before requesting again.' });
    }

    const otp = isDemoMsisdn ? '123456' : crypto.randomInt(100000, 1000000).toString();
    await cache.set(`otp:gameon:${norm}`, otp, 'EX', 300); // 5 min TTL

    if (!isDemoMsisdn) {
      await SpService.sendMt({
        msisdn: norm,
        message: `Your GameOn Tele verification code is ${otp}. Valid for 5 minutes.`,
        type: 'otp',
      });
    }

    return reply.send({
      success: true,
      message: isDemoMsisdn
        ? `Verification code sent to ${maskMsisdn(norm)} (Demo code: 123456)`
        : `Verification code sent to ${maskMsisdn(norm)}`,
      isDemo: isDemoMsisdn,
    });
  });

  fastify.post('/verify-otp', async (req, reply) => {
    const parse = VerifyOtpSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Phone number and OTP code are required', details: parse.error.format() });
    }

    const { phoneNumber, otpCode } = parse.data;
    const norm = normalizeMsisdn(phoneNumber);
    const cached = await cache.get(`otp:gameon:${norm}`);

    const isDemoMsisdn = DEMO_PHONE_NUMBERS.has(norm);
    const isDemoOtp = isDemoMsisdn && otpCode.trim() === '123456';
    if (!isDemoOtp && (!cached || otpCode.trim() !== cached.trim())) {
      return reply.status(400).send({ error: 'Invalid or expired verification code' });
    }

    // Invalidate OTP immediately if cached to prevent replay attacks
    if (cached) {
      await cache.del(`otp:gameon:${norm}`);
    }

    const masked = maskMsisdn(norm);
    const playerRes = await pool.query(
      `INSERT INTO players (msisdn, masked_msisdn, status, last_active_at)
       VALUES ($1, $2, 'ACTIVE', NOW())
       ON CONFLICT (msisdn) DO UPDATE SET last_active_at = NOW()
       RETURNING *`,
      [norm, masked]
    );

    const player = playerRes.rows[0];
    const subRes = await pool.query(
      `SELECT status FROM subscriptions WHERE msisdn = $1 AND status = 'ACTIVE' LIMIT 1`,
      [norm]
    );

    const scoresRes = await pool.query(
      `SELECT game_id, high_score FROM player_game_scores WHERE player_msisdn = $1`,
      [norm]
    );
    const scoreMap: Record<string, number> = {};
    for (const s of scoresRes.rows) {
      scoreMap[s.game_id] = s.high_score;
    }

    const token = jwt.sign(
      { msisdn: norm, id: player.id }, 
      env.JWT_SECRET, 
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );

    return reply.send({
      success: true,
      token,
      profile: {
        id: player.id,
        msisdn: norm,
        maskedMsisdn: masked,
        isLoggedIn: true,
        isSubscribed: subRes.rows.length > 0,
        coins: player.coins,
        highScores: scoreMap,
      },
    });
  });

  fastify.get('/me', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'UNAUTHORIZED' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { msisdn: string; id: string };
      const norm = normalizeMsisdn(decoded.msisdn);
      const playerRes = await pool.query('SELECT * FROM players WHERE msisdn = $1 LIMIT 1', [norm]);
      if (playerRes.rows.length === 0) {
        return reply.status(404).send({ error: 'PLAYER_NOT_FOUND' });
      }
      const player = playerRes.rows[0];
      const subRes = await pool.query(
        `SELECT status, plan_type, next_billing_at FROM subscriptions WHERE msisdn = $1 AND status = 'ACTIVE' LIMIT 1`,
        [norm]
      );
      const scoresRes = await pool.query(
        `SELECT game_id, high_score FROM player_game_scores WHERE player_msisdn = $1`,
        [norm]
      );
      const scoreMap: Record<string, number> = {};
      for (const s of scoresRes.rows) {
        scoreMap[s.game_id] = s.high_score;
      }
      return reply.send({
        success: true,
        profile: {
          id: player.id,
          msisdn: norm,
          maskedMsisdn: player.masked_msisdn,
          isLoggedIn: true,
          isSubscribed: subRes.rows.length > 0,
          highScores: scoreMap,
        },
      });
    } catch {
      return reply.status(401).send({ error: 'INVALID_OR_EXPIRED_TOKEN' });
    }
  });
}

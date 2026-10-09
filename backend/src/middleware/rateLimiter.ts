import { FastifyRequest, FastifyReply } from 'fastify';
import { cache } from '../config/cache.js';

export async function rateLimiter(req: FastifyRequest, reply: FastifyReply) {
  // Allow health checks to pass unmetered
  if (req.url.startsWith('/health')) {
    return;
  }

  const ip = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';
  const ipKey = `rl:ip:${ip}`;

  try {
    const ipHits = await cache.incr(ipKey);
    if (ipHits === 1) await cache.expire(ipKey, 60);
    if (ipHits > 180) {
      return reply.status(429).send({ error: 'Too Many Requests — IP rate limit exceeded. Please wait 60 seconds.' });
    }

    // Secondary rate limiter per MSISDN if present in body or auth token
    const rawBody = req.body as any;
    const msisdn = rawBody?.msisdn || rawBody?.phoneNumber || req.user?.msisdn;
    if (msisdn && typeof msisdn === 'string') {
      const cleanPhone = msisdn.replace(/\D/g, '');
      if (cleanPhone.length >= 9) {
        const phoneKey = `rl:msisdn:${cleanPhone}`;
        const phoneHits = await cache.incr(phoneKey);
        if (phoneHits === 1) await cache.expire(phoneKey, 60);
        if (phoneHits > 60) {
          return reply.status(429).send({ error: 'Too Many Requests — Account request limit exceeded.' });
        }
      }
    }
  } catch {
    // If Valkey is momentarily recovering, continue safely
  }
}

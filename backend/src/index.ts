import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import crypto from 'crypto';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { cache } from './config/cache.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './routes/auth.routes.js';
import { helixRoutes } from './routes/helix.routes.js';
import { competitionRoutes } from './routes/competition.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { CycleSettlementEngine } from './cron/settlementCron.js';

// Production Pino Logger with Redaction & Correlation Tracking
const fastify = Fastify({
  genReqId: (req) => {
    return (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  },
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: ['req.headers.authorization', 'req.headers["x-signature"]', 'req.body.password', 'req.body.otpCode'],
  },
  trustProxy: true,
  disableRequestLogging: false,
});

async function main() {
  // Preserve raw request body buffer for timing-safe HMAC-SHA256 signature validation
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    try {
      (req as any).rawBody = body;
      const json = JSON.parse(body.toString('utf-8'));
      done(null, json);
    } catch (err: any) {
      done(err, undefined);
    }
  });

  // Fastify 5 API Hardening: Helmet with strict headers & DENY framing
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'http:', 'https:'],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
    xContentTypeOptions: true,
  });

  // Role 1 Zero-Trust: Restricted CORS Origin Whitelist (Disallow wildcard '*')
  const ALLOWED_ORIGINS = [
    `https://gameon.${env.DOMAIN}`,
    `https://gameon-admin.${env.DOMAIN}`,
    `https://gameon-tele.${env.DOMAIN}`,
    `https://gameon-tele-admin.${env.DOMAIN}`,
    `http://localhost:${env.PORT}`,
    `http://localhost:${env.ADMIN_PORT}`,
    `http://localhost:3600`,
    `http://localhost:3602`,
    `http://localhost:3603`,
    `http://127.0.0.1:3600`,
    `http://127.0.0.1:3602`,
    `http://127.0.0.1:3603`,
  ];

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server webhooks)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin) || env.NODE_ENV !== 'production') {
        return cb(null, true);
      }
      cb(new Error('Blocked by CORS policy: Origin not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Signature', 'X-Hub-Signature-256', 'X-Request-Id'],
  });

  fastify.addHook('preHandler', rateLimiter);

  // ── Role 6 SRE Probes: Liveness & Readiness ─────────────────────────────────
  fastify.get('/healthz/live', async () => ({
    status: 'ALIVE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/healthz/ready', async (req, reply) => {
    let dbStatus = 'DOWN';
    let valkeyStatus = 'DOWN';

    try {
      await pool.query('SELECT 1');
      dbStatus = 'UP';
    } catch (e: any) {
      dbStatus = `ERROR: ${e.message}`;
    }

    try {
      await cache.ping();
      valkeyStatus = 'UP';
    } catch (e: any) {
      valkeyStatus = `ERROR: ${e.message}`;
    }

    const isHealthy = dbStatus === 'UP' && (valkeyStatus === 'UP' || valkeyStatus === 'PONG_INMEM');
    const statusCode = isHealthy ? 200 : 503;

    return reply.status(statusCode).send({
      status: isHealthy ? 'READY' : 'DEGRADED',
      database: dbStatus,
      valkey: valkeyStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // Backward compatibility health endpoints
  fastify.get('/health', async () => ({ status: 'healthy', service: 'gameon-api', timestamp: new Date().toISOString() }));
  fastify.get('/api/v1/health', async () => ({ status: 'healthy', platform: 'GameOn Tele', version: '1.0.0' }));

  // Routes registration
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(helixRoutes, { prefix: '/api/helix' });
  await fastify.register(competitionRoutes, { prefix: '/api/competition' });
  await fastify.register(competitionRoutes, { prefix: '/api' });
  await fastify.register(webhookRoutes, { prefix: '/api/webhooks' });
  await fastify.register(webhookRoutes, { prefix: '/api/v1/webhooks' });
  await fastify.register(adminRoutes, { prefix: '/api' });

  // Start 7-Day Competition Cycle Settlement Worker
  CycleSettlementEngine.startScheduler();

  try {
    const address = await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(`🚀 GameOn Tele API Server running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// ── Role 6 SRE Graceful Shutdown ─────────────────────────────────────────────
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Shutting down gracefully on ${signal}...`);
    try {
      await fastify.close();
      await cache.quit();
      await pool.end();
      fastify.log.info('Graceful shutdown completed. Exiting 0.');
    } catch (err) {
      fastify.log.error(err);
    }
    process.exit(0);
  });
});

main();

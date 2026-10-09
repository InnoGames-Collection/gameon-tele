import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
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

const fastify = Fastify({
  logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
  trustProxy: true,
});

async function main() {
  // Preserve raw request body buffer for HMAC-SHA256 signature validation
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    try {
      (req as any).rawBody = body;
      const json = JSON.parse(body.toString('utf-8'));
      done(null, json);
    } catch (err: any) {
      done(err, undefined);
    }
  });

  // Fastify 5 API Hardening: Helmet with strict headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'http:', 'https:'],
      },
    },
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  fastify.addHook('preHandler', rateLimiter);

  fastify.get('/health', async () => ({ status: 'healthy', service: 'gameon-api', timestamp: new Date().toISOString() }));
  fastify.get('/api/v1/health', async () => ({ status: 'healthy', platform: 'GameOn Tele', version: '1.0.0' }));

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

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Shutting down gracefully on ${signal}...`);
    try {
      await fastify.close();
      await cache.quit();
      await pool.end();
    } catch (err) {
      fastify.log.error(err);
    }
    process.exit(0);
  });
});

main();

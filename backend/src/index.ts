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

const fastify = Fastify({
  logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
  trustProxy: true,
});

async function main() {
  await fastify.register(helmet, { contentSecurityPolicy: false });
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
  await fastify.register(webhookRoutes, { prefix: '/api/webhooks' });
  await fastify.register(adminRoutes, { prefix: '/api' });

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

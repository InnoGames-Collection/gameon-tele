import { cleanEnv, str, port, num } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3602 }),
  ADMIN_PORT: port({ default: 3603 }),
  HOST: str({ default: '0.0.0.0' }),
  DOMAIN: str({ default: 'innopulseplatform.com' }),

  // PostgreSQL
  DATABASE_URL: str({ default: 'postgresql://postgres:postgres@localhost:5432/gameon' }),
  DB_MAX_CONNECTIONS: num({ default: 20 }),

  // Valkey / Redis
  VALKEY_URL: str({ default: 'redis://localhost:6379' }),

  // Security & Secrets
  JWT_SECRET: str({ default: 'gameon-telecom-jwt-secret-key-prod-2026' }),
  JWT_ACCESS_EXPIRES_IN: str({ default: '24h' }),
  HELIX_RUN_SECRET: str({ default: 'gameon-helix-anti-cheat-secret-2026' }),

  // Telecom SP Gateway
  SP_GATEWAY_URL: str({ default: 'http://168.119.53.26:8484' }),
  SP_API_KEY: str({ default: 'gameon-sp-api-key-2026' }),
  SP_WEBHOOK_SECRET: str({ default: 'gameon-hmac-webhook-secret-2026' }),
  PORTAL_WEBHOOK_SECRET: str({ default: 'gameon-hmac-webhook-secret-2026' }),
  SP_SERVICE_ID: str({ default: 'srv_gameon_daily' }),
  SHORTCODE: str({ default: '9898' }),
});

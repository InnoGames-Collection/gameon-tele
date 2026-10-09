import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { verifySpSignature } from '../middleware/spSignature.js';
import { SpService } from '../services/spService.js';
import { normalizeMsisdn, maskMsisdn } from '../services/helixEngine.js';
import { env } from '../config/env.js';

const WebhookPayloadSchema = z.object({
  event: z.enum(['subscribe', 'unsubscribe', 'renew', 'billing_failed']),
  request_id: z.string().min(1).max(100),
  service_id: z.string().max(50).optional(),
  msisdn: z.string().min(9).max(20),
  timestamp: z.union([z.string(), z.number()]).optional(),
  channel: z.string().optional(),
});

export async function webhookRoutes(fastify: FastifyInstance) {
  /**
   * Telecom VAS Webhook Endpoint (Ethio Telecom Shortcode 7198)
   * Protected with HMAC-SHA256 signature verification.
   */
  fastify.post('/subscription', { preHandler: [verifySpSignature] }, async (req, reply) => {
    // 1. Zod Schema Validation
    const parseResult = WebhookPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'INVALID_PAYLOAD',
        details: parseResult.error.format(),
      });
    }

    const { event, request_id, service_id, msisdn } = parseResult.data;
    const targetServiceId = service_id || env.SP_SERVICE_ID;
    const norm = normalizeMsisdn(msisdn);
    const masked = maskMsisdn(norm);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 2. Idempotency Check: Reject/Acknowledge Duplicate Webhook Deliveries
      const existingEvent = await client.query(
        `SELECT id, processed_at FROM subscription_events WHERE request_id = $1 LIMIT 1`,
        [request_id]
      );

      if (existingEvent.rows.length > 0) {
        await client.query('ROLLBACK');
        return reply.status(200).send({
          success: true,
          status: 'IDEMPOTENT_DUPLICATE',
          message: 'Webhook event was previously processed.',
          processed_at: existingEvent.rows[0].processed_at,
        });
      }

      // 3. Immutable Audit Logging in subscription_events
      await client.query(
        `INSERT INTO subscription_events (request_id, event_type, msisdn, service_id, raw_payload, signature_verified, processed_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, NOW())`,
        [request_id, event, norm, targetServiceId, JSON.stringify(req.body)]
      );

      let sendWelcomeSms = false;

      // 4. State Machine Execution
      if (event === 'subscribe' || event === 'renew') {
        const subRes = await client.query(
          `INSERT INTO subscriptions (msisdn, shortcode, service_id, status, plan_type, price_etb, renew_count, last_billed_at, next_billing_at, updated_at)
           VALUES ($1, $2, $3, 'ACTIVE', 'daily', 2.00, 1, NOW(), NOW() + INTERVAL '1 day', NOW())
           ON CONFLICT (msisdn, service_id) 
           DO UPDATE SET 
             status = 'ACTIVE',
             renew_count = subscriptions.renew_count + CASE WHEN $4 = 'renew' THEN 1 ELSE 0 END,
             last_billed_at = NOW(),
             next_billing_at = NOW() + INTERVAL '1 day',
             updated_at = NOW()
           RETURNING (xmax = 0) AS is_new_insert`,
          [norm, env.SHORTCODE, targetServiceId, event]
        );

        await client.query(
          `INSERT INTO players (msisdn, masked_msisdn, status, last_active_at)
           VALUES ($1, $2, 'ACTIVE', NOW())
           ON CONFLICT (msisdn) DO UPDATE SET 
             status = 'ACTIVE',
             last_active_at = NOW()`,
          [norm, masked]
        );

        if (event === 'subscribe' && subRes.rows[0]?.is_new_insert) {
          sendWelcomeSms = true;
        }
      } else if (event === 'unsubscribe') {
        await client.query(
          `UPDATE subscriptions 
           SET status = 'UNSUBSCRIBED', updated_at = NOW() 
           WHERE msisdn = $1 AND service_id = $2`,
          [norm, targetServiceId]
        );
      } else if (event === 'billing_failed') {
        // Suspend subscription on billing failure so user cannot exploit tournament prize pool
        await client.query(
          `UPDATE subscriptions 
           SET status = 'SUSPENDED', updated_at = NOW() 
           WHERE msisdn = $1 AND service_id = $2`,
          [norm, targetServiceId]
        );
      }

      await client.query('COMMIT');

      // 5. Asynchronous Welcome MT SMS Notification
      if (sendWelcomeSms) {
        SpService.sendMt({
          msisdn: norm,
          message: `Welcome to GameOn Tele! Daily pass active (2 ETB/day). Compete in 3D Helix Jump and win 20,000 ETB: https://gameon.${env.DOMAIN}`,
          type: 'optin',
        }).catch((err) => {
          req.log.error({ err, msisdn: norm }, 'Failed to dispatch welcome SMS');
        });
      }

      return reply.send({
        success: true,
        status: 'PROCESSED',
        event,
        msisdn: masked,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      req.log.error(err, 'Failed to process subscription webhook');
      return reply.status(500).send({ error: 'DATABASE_TRANSACTION_FAILED' });
    } finally {
      client.release();
    }
  });

  fastify.post('/dlr', async (req) => {
    req.log.info({ dlr: req.body }, 'Received delivery receipt (DLR)');
    return { received: true };
  });
}

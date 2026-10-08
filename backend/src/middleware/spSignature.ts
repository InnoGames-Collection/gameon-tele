import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { env } from '../config/env.js';

export async function verifySpSignature(req: FastifyRequest, reply: FastifyReply) {
  const signatureHeader = (req.headers['x-signature'] || req.headers['x-hub-signature-256']) as string;
  if (!signatureHeader) {
    return reply.status(401).send({ error: 'Missing X-Signature header' });
  }

  // Clean prefix if provided (e.g. 'sha256=abcdef...')
  const cleanReceivedSig = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader;

  // Retrieve raw buffer or string if preserved, else fallback to JSON stringify
  const rawBody = (req as any).rawBody
    ? (req as any).rawBody.toString('utf-8')
    : JSON.stringify(req.body);

  const secret = env.PORTAL_WEBHOOK_SECRET || env.SP_WEBHOOK_SECRET;
  const expectedHash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  // Guard against differing string lengths before timingSafeEqual
  const receivedBuf = Buffer.from(cleanReceivedSig, 'hex');
  const expectedBuf = Buffer.from(expectedHash, 'hex');

  if (receivedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
    return reply.status(403).send({ error: 'Invalid HMAC-SHA256 signature' });
  }
}

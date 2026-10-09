import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { env } from '../config/env.js';

export async function verifySpSignature(req: FastifyRequest, reply: FastifyReply) {
  const signatureHeader = (
    req.headers['x-signature'] || 
    req.headers['x-hub-signature-256'] ||
    req.headers['x-telecom-signature']
  ) as string;

  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return reply.status(401).send({ 
      error: 'UNAUTHORIZED_WEBHOOK', 
      message: 'Missing required cryptographic X-Signature header' 
    });
  }

  // Clean prefix if provided (e.g. 'sha256=abcdef...')
  const cleanReceivedSig = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7).trim()
    : signatureHeader.trim();

  // Validate hex format (must be 64-char hex for sha256)
  if (!/^[0-9a-fA-F]{64}$/.test(cleanReceivedSig)) {
    return reply.status(403).send({ 
      error: 'INVALID_SIGNATURE_FORMAT', 
      message: 'Malformed signature header format' 
    });
  }

  // Retrieve raw buffer or string if preserved, else fallback to JSON stringify
  const rawBody = (req as any).rawBody
    ? (req as any).rawBody.toString('utf-8')
    : typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);

  const secret = env.PORTAL_WEBHOOK_SECRET || env.SP_WEBHOOK_SECRET;
  const expectedHash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const receivedBuf = Buffer.from(cleanReceivedSig.toLowerCase(), 'hex');
  const expectedBuf = Buffer.from(expectedHash.toLowerCase(), 'hex');

  if (receivedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
    return reply.status(403).send({ 
      error: 'SIGNATURE_VERIFICATION_FAILED', 
      message: 'Cryptographic HMAC-SHA256 signature verification failed' 
    });
  }
}

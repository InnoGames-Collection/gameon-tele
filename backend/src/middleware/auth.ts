import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { cache } from '../config/cache.js';

export interface PlayerAuthPayload {
  id?: string;
  msisdn: string;
}

export interface AdminAuthPayload {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'OPERATOR' | 'AUDITOR';
  msisdn?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: PlayerAuthPayload;
    admin?: AdminAuthPayload;
  }
}

/**
 * Revokes a JWT immediately by recording its signature in Valkey with TTL.
 */
export async function revokeToken(token: string, ttlSeconds: number = 900): Promise<void> {
  const key = `gameon:blacklist:${token}`;
  await cache.set(key, 'REVOKED', 'EX', ttlSeconds);
}

/**
 * Checks if a token has been revoked / blacklisted.
 */
export async function isTokenRevoked(token: string): Promise<boolean> {
  const key = `gameon:blacklist:${token}`;
  const res = await cache.get(key);
  return res === 'REVOKED';
}

/**
 * Verifies Player Bearer Token (using JWT_SECRET)
 */
export async function verifyAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.substring(7);

  // Check Valkey blacklist revocation
  if (await isTokenRevoked(token)) {
    return reply.status(401).send({ error: 'Token has been revoked or session terminated' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as PlayerAuthPayload;
    req.user = decoded;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired player session token' });
  }
}

/**
 * Verifies Administrative Bearer Token (using ADMIN_JWT_SECRET with strict RBAC)
 */
export async function verifyAdmin(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing administrative Authorization header' });
  }

  const token = authHeader.substring(7);

  // Check Valkey blacklist revocation
  if (await isTokenRevoked(token)) {
    return reply.status(401).send({ error: 'Administrative session has been revoked' });
  }

  try {
    // Role 1 Zero-Trust: Dedicated ADMIN_JWT_SECRET ensures player tokens cannot access admin APIs
    const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminAuthPayload;
    if (!decoded || !['SUPER_ADMIN', 'OPERATOR', 'AUDITOR'].includes(decoded.role)) {
      return reply.status(403).send({ error: 'Forbidden: Insufficient administrative privileges' });
    }
    req.admin = decoded;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired administrative token' });
  }
}

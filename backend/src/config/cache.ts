import { Redis } from 'ioredis';
import { env } from './env.js';

const realRedis = new Redis(env.VALKEY_URL, {
  maxRetriesPerRequest: 1,
  connectTimeout: 400,
  enableOfflineQueue: false,
  retryStrategy: () => null,
  lazyConnect: true,
});

let isRedisConnected = false;

realRedis.connect().then(() => {
  isRedisConnected = true;
  console.log('✅ Valkey/Redis connected successfully');
}).catch(() => {
  isRedisConnected = false;
});

realRedis.on('error', () => {
  isRedisConnected = false;
});

// Resilient In-Memory Cache Store for 0ms sub-millisecond local latency
const memStore = new Map<string, { value: any; expiresAt?: number }>();
const zsetStore = new Map<string, Map<string, number>>();

export const cache = {
  async get(key: string): Promise<string | null> {
    if (isRedisConnected) {
      try { return await realRedis.get(key); } catch {}
    }
    const item = memStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memStore.delete(key);
      return null;
    }
    return String(item.value);
  },

  async set(key: string, value: any, ...args: any[]): Promise<string | null> {
    if (isRedisConnected) {
      try { return await (realRedis as any).set(key, value, ...args); } catch {}
    }
    let expiresAt: number | undefined;
    const exIdx = args.findIndex((a) => typeof a === 'string' && a.toUpperCase() === 'EX');
    if (exIdx !== -1 && args[exIdx + 1]) {
      expiresAt = Date.now() + Number(args[exIdx + 1]) * 1000;
    }
    const nxIdx = args.findIndex((a) => typeof a === 'string' && a.toUpperCase() === 'NX');
    if (nxIdx !== -1 && memStore.has(key)) {
      const existing = memStore.get(key);
      if (!existing?.expiresAt || Date.now() <= existing.expiresAt) return null;
    }
    memStore.set(key, { value, expiresAt });
    return 'OK';
  },

  async del(key: string): Promise<number> {
    if (isRedisConnected) {
      try { return await realRedis.del(key); } catch {}
    }
    return memStore.delete(key) ? 1 : 0;
  },

  async incr(key: string): Promise<number> {
    if (isRedisConnected) {
      try { return await realRedis.incr(key); } catch {}
    }
    const item = memStore.get(key);
    let val = 0;
    if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
      val = parseInt(item.value, 10) || 0;
    }
    val += 1;
    memStore.set(key, { value: val, expiresAt: item?.expiresAt });
    return val;
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (isRedisConnected) {
      try { return await realRedis.expire(key, seconds); } catch {}
    }
    const item = memStore.get(key);
    if (item) {
      item.expiresAt = Date.now() + seconds * 1000;
      return 1;
    }
    return 0;
  },

  async zadd(key: string, score: number, member: string): Promise<number> {
    if (isRedisConnected) {
      try { return await realRedis.zadd(key, score, member); } catch {}
    }
    if (!zsetStore.has(key)) zsetStore.set(key, new Map());
    const z = zsetStore.get(key)!;
    z.set(member, score);
    return 1;
  },

  async zrevrank(key: string, member: string): Promise<number | null> {
    if (isRedisConnected) {
      try { return await realRedis.zrevrank(key, member); } catch {}
    }
    const z = zsetStore.get(key);
    if (!z || !z.has(member)) return null;
    const sorted = Array.from(z.entries()).sort((a, b) => b[1] - a[1]);
    const idx = sorted.findIndex((e) => e[0] === member);
    return idx === -1 ? null : idx;
  },

  async zrevrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]> {
    if (isRedisConnected) {
      try { return await (realRedis as any).zrevrange(key, start, stop, withScores); } catch {}
    }
    const z = zsetStore.get(key);
    if (!z) return [];
    const sorted = Array.from(z.entries()).sort((a, b) => b[1] - a[1]);
    const sliced = sorted.slice(start, stop === -1 ? undefined : stop + 1);
    const result: string[] = [];
    for (const [m, s] of sliced) {
      result.push(m);
      if (withScores?.toUpperCase() === 'WITHSCORES') {
        result.push(String(s));
      }
    }
    return result;
  },

  async rename(oldKey: string, newKey: string): Promise<string> {
    if (isRedisConnected) {
      try { return await realRedis.rename(oldKey, newKey); } catch {}
    }
    if (memStore.has(oldKey)) {
      memStore.set(newKey, memStore.get(oldKey)!);
      memStore.delete(oldKey);
    }
    if (zsetStore.has(oldKey)) {
      zsetStore.set(newKey, zsetStore.get(oldKey)!);
      zsetStore.delete(oldKey);
    }
    return 'OK';
  },

  async eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<any> {
    if (isRedisConnected) {
      try { return await (realRedis as any).eval(script, numkeys, ...args); } catch {}
    }
    if (numkeys >= 1 && args.length >= 2) {
      const key = String(args[0]);
      const expectedVal = String(args[1]);
      const current = memStore.get(key);
      if (current && String(current.value) === expectedVal) {
        memStore.delete(key);
        return 1;
      }
      return 0;
    }
    return 1;
  },

  async quit(): Promise<string> {
    try { await realRedis.quit(); } catch {}
    return 'OK';
  },
};

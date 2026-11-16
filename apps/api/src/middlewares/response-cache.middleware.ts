import { createHash } from 'node:crypto';
import type { RequestHandler, Response } from 'express';
import { cache } from '@/configs/cache';

const CACHE_VERSION_KEY = 'ats:http-cache:version';
const DEFAULT_TTL_SECONDS = 30;

type CachedResponse = {
  statusCode: number;
  body: unknown;
};

export const cacheGetResponse: RequestHandler = async (req, res, next) => {
  if (req.method !== 'GET' || !req.user) return next();

  const user = req.user;
  const version = (await cache.get(CACHE_VERSION_KEY).catch(() => null)) ?? '0';
  const requestHash = createHash('sha256').update(req.originalUrl).digest('hex');
  const key = `ats:http-cache:${version}:${user.id}:${user.role}:${requestHash}`;

  try {
    const cached = await cache.get(key);
    if (cached) {
      const response = JSON.parse(cached) as CachedResponse;
      res.setHeader('X-Response-Cache', 'HIT');
      return res.status(response.statusCode).json(response.body);
    }
  } catch {
    // Redis is an optimization; a cache miss or cache outage should not fail the request.
  }

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    res.setHeader('X-Response-Cache', 'MISS');

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const entry: CachedResponse = { statusCode: res.statusCode, body };
      const ttlSeconds = Number(process.env.HTTP_CACHE_TTL_SECONDS) || DEFAULT_TTL_SECONDS;
      void cache.set(key, JSON.stringify(entry), 'EX', ttlSeconds).catch(() => undefined);
    }

    return originalJson(body);
  }) as Response['json'];

  return next();
};

export const invalidateGetResponseCache: RequestHandler = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  res.once('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      void cache.incr(CACHE_VERSION_KEY).catch(() => undefined);
    }
  });

  return next();
};

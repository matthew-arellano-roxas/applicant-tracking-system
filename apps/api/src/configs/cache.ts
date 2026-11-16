import Redis from 'ioredis';

export const cache = process.env.REDIS_CACHE_URL
  ? new Redis(process.env.REDIS_CACHE_URL)
  : new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });

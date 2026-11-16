import { rateLimit } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';

import { cache } from '@/configs';
import { ApiError } from '@/utils/ApiError';

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

export function createRateLimit({ keyPrefix, limit, windowMs }: RateLimitOptions) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new RedisStore({
      prefix: `rate-limit:${keyPrefix}:`,
      sendCommand: (command, ...args) =>
        cache.call(command, ...args) as Promise<RedisReply>,
    }),
    handler: (_req, _res, next) => {
      next(ApiError.tooManyRequests('Too many requests. Try again later.'));
    },
  });
}

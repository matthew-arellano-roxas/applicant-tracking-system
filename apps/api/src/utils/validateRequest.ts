import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { ApiError } from '@/utils/ApiError';

type RequestSource = 'body' | 'params' | 'query' | 'cookies';

export function validateRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  source: RequestSource = 'body',
  options: { statusCode?: 400 | 401; message?: string } = {},
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = options.message ?? result.error.issues.map((issue) => issue.message).join('; ');
      next(options.statusCode === 401 ? ApiError.unauthorized(message) : ApiError.badRequest(message));
      return;
    }

    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
}

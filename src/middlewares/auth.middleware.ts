import type { Request, RequestHandler } from 'express';
import { ApiError } from '@/utils/ApiError';
import { COOKIE_NAME } from '@/utils/cookie';
import { verifyToken } from '@/services/token.service';
import type { TokenPayload } from '@/types';

const readToken = (req: Request): string | undefined => req.cookies?.[COOKIE_NAME];

const tryVerify = (token: string): TokenPayload | null => {
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = readToken(req);
  const payload = token ? tryVerify(token) : null;
  if (!payload) return next(ApiError.unauthorized());
  res.locals.auth = payload;
  next();
};

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (_req, res, next) =>
    roles.includes(res.locals.auth?.role) ? next() : next(ApiError.forbidden());

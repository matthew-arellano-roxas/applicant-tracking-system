import type { RequestHandler } from 'express';
import { verifyAccessToken } from '@/services/token.service';
import { accessCookieSchema } from '@/schemas/auth.schema';

export const requireAuth: RequestHandler = (req, res, next) => {
  const cookies = accessCookieSchema.safeParse(req.cookies);

  if (!cookies.success) {
    res.status(401).json({
      message: 'Authentication required',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(cookies.data.access_token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch (error) {
    // Invalid or expired JWTs are authentication failures.
    // Unexpected server errors should reach the error handler.
    if (
      error instanceof Error &&
      (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'NotBeforeError')
    ) {
      res.status(401).json({
        message: 'Invalid or expired token',
      });
      return;
    }

    return next(error);
  }
};

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Access denied',
      });
      return;
    }

    return next();
  };

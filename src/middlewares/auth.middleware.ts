import type { RequestHandler } from 'express';
import { verifyAccessToken } from '@/services/token.service';

export const requireAuth: RequestHandler = (req, res, next) => {
  const token: unknown = req.cookies?.access_token;

  if (typeof token !== 'string') {
    res.status(401).json({
      message: 'Authentication required',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

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
  (role: string): RequestHandler =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        message: 'Access denied',
      });
      return;
    }

    return next();
  };

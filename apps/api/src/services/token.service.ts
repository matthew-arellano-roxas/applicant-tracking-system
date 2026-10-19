import jwt from 'jsonwebtoken';
import { env } from '@/configs/env';
import { ApiError } from '@/utils/ApiError';
import type { TokenPayload } from '@/types';

export const TOKEN_TTL_SECONDS = 60 * 60 * 24;
export const ACCESS_TOKEN_TTL = 15 * 60;
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

export const getSecret = (): string => {
  if (!env.JWT_SECRET) {
    throw ApiError.internal('JWT_SECRET is not configured');
  }

  return env.JWT_SECRET;
};

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, getSecret(), {
    expiresIn: TOKEN_TTL_SECONDS,
    algorithm: 'HS256',
  });

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign({ sub: payload.sub, role: payload.role, tokenUse: 'access' }, getSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: 'HS256',
  });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign({ sub: payload.sub, tokenUse: 'refresh' }, getSecret(), {
    expiresIn: REFRESH_TOKEN_TTL,
    algorithm: 'HS256',
  });

export const verifyAccessToken = (token: string): TokenPayload => {
  const payload = verifyToken(token);

  if (payload.tokenUse !== 'access' || typeof payload.role !== 'string') {
    throw ApiError.unauthorized('Invalid access token');
  }

  return payload as TokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  const payload = verifyToken(token);

  if (payload.tokenUse !== 'refresh') {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  return { sub: payload.sub };
};

function verifyToken(token: string): jwt.JwtPayload {
  const payload = jwt.verify(token, getSecret(), {
    algorithms: ['HS256'],
  });

  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    typeof payload.tokenUse !== 'string'
  ) {
    throw ApiError.unauthorized('Invalid token payload');
  }

  return payload;
}

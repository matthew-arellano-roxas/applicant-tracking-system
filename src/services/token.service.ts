import jwt from 'jsonwebtoken';
import { env } from '@/configs/env';
import { ApiError } from '@/utils/ApiError';
import type { TokenPayload } from '@/types';

export const TOKEN_TTL_SECONDS = 60 * 60 * 24;

const getSecret = (): string => {
  if (!env.JWT_SECRET) throw ApiError.internal('JWT_SECRET is not configured');
  return env.JWT_SECRET;
};

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL_SECONDS });

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, getSecret()) as TokenPayload;
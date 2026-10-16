import type { CookieOptions, Response } from 'express';
import { TOKEN_TTL_SECONDS } from '@/services/token.service';

export const COOKIE_NAME = 'access_token';

const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, { ...baseOptions(), maxAge: TOKEN_TTL_SECONDS * 1000 });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, baseOptions());
};

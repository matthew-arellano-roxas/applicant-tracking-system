import type { RequestHandler } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { authenticateWith } from '@/utils/authenticate';
import { clearAuthCookie, setAuthCookie } from '@/utils/cookie';
import { issueToken } from '@/services/auth.service';
import { PASSWORD_STRATEGY } from '@/strategies/password.strategy';

export const loginWithPassword = asyncHandler(async (req, res) => {
  const { userId } = await authenticateWith(PASSWORD_STRATEGY, req, res);
  setAuthCookie(res, await issueToken(userId));
  res.status(204).end();
});

export const logout: RequestHandler = (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
};

export const me: RequestHandler = (_req, res) => {
  res.json(res.locals.auth);
};

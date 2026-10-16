import type { Request, Response } from 'express';
import passport, { type AuthenticateOptions } from 'passport';
import { ApiError } from '@/utils/ApiError';
import type { AuthResult } from '@/types';

type Outcome = AuthResult | false | null | undefined;

const toResult = (
  err: unknown,
  user: Outcome,
  resolve: (r: AuthResult) => void,
  reject: (e: unknown) => void,
): void => {
  if (err) return reject(err);
  if (!user) return reject(ApiError.unauthorized('Invalid credentials'));
  resolve(user);
};

export const authenticateWith = (
  strategy: string,
  req: Request,
  res: Response,
  options: AuthenticateOptions = {},
): Promise<AuthResult> =>   
  new Promise((resolve, reject) => {
    const callback = (err: unknown, user?: Outcome) => toResult(err, user, resolve, reject);
    passport.authenticate(strategy, { ...options, session: false }, callback)(req, res, reject);
  });

import { Router } from 'express';
import passport from 'passport';

import { login, refresh, logout, getMe, updateMe, changeMyPassword, register, verifyOtp, completePasswordReset, requestPasswordReset } from '@/controllers';
import { requireAuth } from '@/middlewares/auth.middleware';
import { createRateLimit } from '@/middlewares/rate-limit.middleware';
import {
  changeCurrentUserPasswordBodySchema,
  updateCurrentUserBodySchema,
} from '@/schemas/user.schema';
import {
  loginBodySchema,
  refreshCookieSchema,
  registerBodySchema,
  verifyOtpBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
} from '@/schemas/auth.schema';
import { validateRequest } from '@/utils/validateRequest';

const authRoute = Router();
const loginRateLimit = createRateLimit({ keyPrefix: 'auth:login', limit: 10, windowMs: 15 * 60_000 });
const registrationRateLimit = createRateLimit({ keyPrefix: 'auth:register', limit: 5, windowMs: 15 * 60_000 });
const registrationVerifyRateLimit = createRateLimit({ keyPrefix: 'auth:register-verify', limit: 10, windowMs: 15 * 60_000 });
const passwordResetRequestRateLimit = createRateLimit({ keyPrefix: 'auth:password-reset-request', limit: 5, windowMs: 15 * 60_000 });
const passwordResetCompleteRateLimit = createRateLimit({ keyPrefix: 'auth:password-reset-complete', limit: 10, windowMs: 15 * 60_000 });
const passwordChangeRateLimit = createRateLimit({ keyPrefix: 'auth:password-change', limit: 5, windowMs: 15 * 60_000 });

authRoute.post(
  '/login',
  loginRateLimit,
  validateRequest(loginBodySchema),
  (req, res, next) =>
    passport.authenticate(
      'local',
      { session: false },
      (error: unknown, user: Express.User | false | null | undefined) => {
        if (error) return next(error);
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        req.user = user;
        return next();
      },
    )(req, res, next),
  login,
);

authRoute.post(
  '/refresh',
  validateRequest(refreshCookieSchema, 'cookies', {
    statusCode: 401,
    message: 'Refresh token required',
  }),
  refresh,
);

authRoute.post('/logout', logout);

authRoute.get('/me', requireAuth, getMe);
authRoute.patch('/me', requireAuth, validateRequest(updateCurrentUserBodySchema), updateMe);
authRoute.patch(
  '/me/password',
  requireAuth,
  passwordChangeRateLimit,
  validateRequest(changeCurrentUserPasswordBodySchema),
  changeMyPassword,
);

authRoute.post('/register', registrationRateLimit, validateRequest(registerBodySchema), register);

authRoute.post('/register/verify', registrationVerifyRateLimit, validateRequest(verifyOtpBodySchema), verifyOtp);

authRoute.post('/forgot-password', passwordResetRequestRateLimit, validateRequest(requestPasswordResetBodySchema), requestPasswordReset);
authRoute.post('/forgot-password/reset', passwordResetCompleteRateLimit, validateRequest(resetPasswordBodySchema), completePasswordReset);

export { authRoute };

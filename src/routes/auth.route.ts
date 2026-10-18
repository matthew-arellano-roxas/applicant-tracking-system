import { Router } from 'express';
import passport from 'passport';

import { login, refresh, logout, getMe, register, verifyOtp } from '@/controllers';
import { requireAuth } from '@/middlewares/auth.middleware';
import {
  loginBodySchema,
  refreshCookieSchema,
  registerBodySchema,
  verifyOtpBodySchema,
} from '@/schemas/auth.schema';
import { validateRequest } from '@/utils/validateRequest';

const authRoute = Router();

authRoute.post(
  '/login',
  validateRequest(loginBodySchema),
  passport.authenticate('local', { session: false }),
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

authRoute.post('/register', validateRequest(registerBodySchema), register);

authRoute.post('/register/verify', validateRequest(verifyOtpBodySchema), verifyOtp);

export { authRoute };

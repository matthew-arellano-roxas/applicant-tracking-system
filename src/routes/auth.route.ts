import { Router } from 'express';
import passport from 'passport';

import { login, refresh, logout, getMe } from '@/controllers';
import { requireAuth } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const authRoute = Router();

authRoute.post('/login', passport.authenticate('local', { session: false }), asyncHandler(login));

authRoute.post('/refresh', asyncHandler(refresh));

authRoute.post('/logout', asyncHandler(logout));

authRoute.get('/me', requireAuth, asyncHandler(getMe));

export { authRoute };

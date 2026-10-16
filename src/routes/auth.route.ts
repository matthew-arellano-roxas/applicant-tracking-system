import { Router } from 'express';
import passport from 'passport';

import { login, refresh, logout, getMe, register, verifyOtp } from '@/controllers';
import { requireAuth } from '@/middlewares/auth.middleware';

const authRoute = Router();

authRoute.post('/login', passport.authenticate('local', { session: false }), login);

authRoute.post('/refresh', refresh);

authRoute.post('/logout', logout);

authRoute.get('/me', requireAuth, getMe);

authRoute.post('/register', register);

authRoute.post('/register/verify', verifyOtp);

export { authRoute };

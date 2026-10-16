import { Router } from 'express';
import { loginWithPassword, logout, me } from '@/controllers/auth.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/login/password', loginWithPassword);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);

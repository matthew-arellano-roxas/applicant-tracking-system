import express, { Router } from 'express';
import { UserRole } from '@/constants';
import { uploadMyCv } from '@/controllers/cv.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';

const cvRoute = Router();

cvRoute.post(
  '/upload',
  requireAuth,
  requireRole(UserRole.Applicant),
  express.raw({ type: 'application/pdf', limit: '5mb' }),
  uploadMyCv,
);

export { cvRoute };

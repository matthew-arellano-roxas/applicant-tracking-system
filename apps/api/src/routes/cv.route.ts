import { Router } from 'express';
import { UserRole } from '@/constants';
import {
  confirmMyCvUpload,
  createMyCvUploadUrl,
  getCvDownloadUrl,
  getMyCvDownloadUrl,
} from '@/controllers/cv.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import {
  confirmCvUploadBodySchema,
  createCvUploadUrlBodySchema,
  cvOwnerParamsSchema,
} from '@/schemas/cv.schema';
import { validateRequest } from '@/utils/validateRequest';

const cvRoute = Router();

cvRoute.use(requireAuth);

cvRoute.post(
  '/upload-url',
  requireRole(UserRole.Applicant),
  validateRequest(createCvUploadUrlBodySchema),
  createMyCvUploadUrl,
);

cvRoute.post(
  '/confirm-upload',
  requireRole(UserRole.Applicant),
  validateRequest(confirmCvUploadBodySchema),
  confirmMyCvUpload,
);

cvRoute.get('/me/download', getMyCvDownloadUrl);
cvRoute.get('/:userId/download', validateRequest(cvOwnerParamsSchema, 'params'), getCvDownloadUrl);

export { cvRoute };

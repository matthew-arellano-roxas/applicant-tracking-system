import { Router } from 'express';
import { UserRole } from '@/constants';
import {
  createApplication,
  getApplication,
  listApplications,
  listMyApplications,
  retryApplicationScoring,
  updateApplicationStatus,
} from '@/controllers/applicant.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import {
  applicationIdParamsSchema,
  applicationListQuerySchema,
  createApplicationBodySchema,
  updateApplicationStatusBodySchema,
} from '@/schemas/applicant.schema';
import { validateRequest } from '@/utils/validateRequest';

const applicantRoute = Router();
const managerRoles = [UserRole.Admin, UserRole.Hr];

applicantRoute.use(requireAuth);
applicantRoute.post(
  '/',
  requireRole(UserRole.Applicant),
  validateRequest(createApplicationBodySchema),
  createApplication,
);
applicantRoute.get(
  '/',
  requireRole(...managerRoles),
  validateRequest(applicationListQuerySchema, 'query'),
  listApplications,
);
applicantRoute.get(
  '/me',
  requireRole(UserRole.Applicant),
  validateRequest(applicationListQuerySchema, 'query'),
  listMyApplications,
);
applicantRoute.post(
  '/:id/retry-scoring',
  validateRequest(applicationIdParamsSchema, 'params'),
  retryApplicationScoring,
);
applicantRoute.patch(
  '/:id/status',
  requireRole(...managerRoles),
  validateRequest(applicationIdParamsSchema, 'params'),
  validateRequest(updateApplicationStatusBodySchema),
  updateApplicationStatus,
);
applicantRoute.get('/:id', validateRequest(applicationIdParamsSchema, 'params'), getApplication);

export { applicantRoute };

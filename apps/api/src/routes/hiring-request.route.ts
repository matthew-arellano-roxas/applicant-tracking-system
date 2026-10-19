import { Router } from 'express';

import {
  createHiringRequest,
  getHiringRequest,
  listHiringRequests,
  updateHiringRequest,
  updateHiringRequestStatus,
} from '@/controllers/hiring-request.controller';
import { requireAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/constants';
import {
  createHiringRequestBodySchema,
  hiringRequestIdParamsSchema,
  hiringRequestListQuerySchema,
  updateHiringRequestBodySchema,
  updateHiringRequestStatusBodySchema,
} from '@/schemas/hiring-request.schema';
import { validateRequest } from '@/utils/validateRequest';

const hiringRequestRoute = Router();
const hiringRequestReadRoles = [
  UserRole.Admin,
  UserRole.Hr,
  UserRole.Dean,
  UserRole.DepartmentHead,
  UserRole.Employee,
];
const hiringRequestManagerRoles = [
  UserRole.Admin,
  UserRole.Hr,
  UserRole.Dean,
  UserRole.DepartmentHead,
];

hiringRequestRoute.use(requireAuth);
hiringRequestRoute.get('/', requireRole(...hiringRequestReadRoles), validateRequest(hiringRequestListQuerySchema, 'query'), listHiringRequests);
hiringRequestRoute.post('/', requireRole(...hiringRequestManagerRoles), validateRequest(createHiringRequestBodySchema), createHiringRequest);
hiringRequestRoute.get(
  '/:id',
  requireRole(...hiringRequestReadRoles),
  validateRequest(hiringRequestIdParamsSchema, 'params'),
  getHiringRequest,
);
hiringRequestRoute.patch(
  '/:id',
  requireRole(...hiringRequestManagerRoles),
  validateRequest(hiringRequestIdParamsSchema, 'params'),
  validateRequest(updateHiringRequestBodySchema),
  updateHiringRequest,
);
hiringRequestRoute.patch(
  '/:id/status',
  requireRole(UserRole.Admin, UserRole.Hr, UserRole.Dean),
  validateRequest(hiringRequestIdParamsSchema, 'params'),
  validateRequest(updateHiringRequestStatusBodySchema),
  updateHiringRequestStatus,
);

export { hiringRequestRoute };

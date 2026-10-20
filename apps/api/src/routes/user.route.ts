import { Router } from 'express';

import { assignUserRole, listUsers } from '@/controllers/user.controller';
import { UserRole } from '@/constants';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import {
  assignUserRoleBodySchema,
  assignUserRoleParamsSchema,
  userListQuerySchema,
} from '@/schemas/user.schema';
import { validateRequest } from '@/utils/validateRequest';

const userRoute = Router();

userRoute.get('/', requireAuth, requireRole(UserRole.Admin), validateRequest(userListQuerySchema, 'query'), listUsers);

userRoute.patch(
  '/:id/role',
  requireAuth,
  requireRole(UserRole.Admin),
  validateRequest(assignUserRoleParamsSchema, 'params'),
  validateRequest(assignUserRoleBodySchema),
  assignUserRole,
);

export { userRoute };

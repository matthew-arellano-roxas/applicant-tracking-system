import { Router } from 'express';

import {
  addDepartmentMember,
  assignDepartmentHead,
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartmentMembers,
  listDepartments,
  removeDepartmentHead,
  removeDepartmentMember,
  updateDepartment,
} from '@/controllers/department.controller';
import { requireAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/constants';
import {
  addDepartmentMemberBodySchema,
  assignDepartmentHeadBodySchema,
  createDepartmentBodySchema,
  departmentIdParamsSchema,
  departmentMemberParamsSchema,
  updateDepartmentBodySchema,
} from '@/schemas/department.schema';
import { validateRequest } from '@/utils/validateRequest';

const departmentRoute = Router();
const departmentReadRoles = [
  UserRole.Admin,
  UserRole.DepartmentHead,
  UserRole.Dean,
  UserRole.Hr,
  UserRole.Employee,
];
const departmentManagerRoles = [UserRole.Admin, UserRole.Hr];
const departmentMemberManagerRoles = [UserRole.Admin, UserRole.Hr, UserRole.DepartmentHead];

departmentRoute.use(requireAuth);
departmentRoute.get('/', requireRole(...departmentReadRoles), listDepartments);
departmentRoute.post('/', requireRole(...departmentManagerRoles), validateRequest(createDepartmentBodySchema), createDepartment);
departmentRoute.get('/:id', requireRole(...departmentReadRoles), validateRequest(departmentIdParamsSchema, 'params'), getDepartment);
departmentRoute.patch(
  '/:id',
  requireRole(...departmentManagerRoles),
  validateRequest(departmentIdParamsSchema, 'params'),
  validateRequest(updateDepartmentBodySchema),
  updateDepartment,
);
departmentRoute.patch(
  '/:id/head',
  requireRole(UserRole.Admin, UserRole.Hr, UserRole.Dean),
  validateRequest(departmentIdParamsSchema, 'params'),
  validateRequest(assignDepartmentHeadBodySchema),
  assignDepartmentHead,
);
departmentRoute.delete(
  '/:id/head',
  requireRole(...departmentManagerRoles),
  validateRequest(departmentIdParamsSchema, 'params'),
  removeDepartmentHead,
);
departmentRoute.delete(
  '/:id',
  requireRole(UserRole.Admin),
  validateRequest(departmentIdParamsSchema, 'params'),
  deleteDepartment,
);
departmentRoute.get(
  '/:id/members',
  requireRole(...departmentReadRoles),
  validateRequest(departmentIdParamsSchema, 'params'),
  listDepartmentMembers,
);
departmentRoute.post(
  '/:id/members',
  requireRole(...departmentMemberManagerRoles),
  validateRequest(departmentIdParamsSchema, 'params'),
  validateRequest(addDepartmentMemberBodySchema),
  addDepartmentMember,
);
departmentRoute.delete(
  '/:id/members/:employeeId',
  requireRole(...departmentMemberManagerRoles),
  validateRequest(departmentMemberParamsSchema, 'params'),
  removeDepartmentMember,
);

export { departmentRoute };

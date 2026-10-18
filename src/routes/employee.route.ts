import { Router } from 'express';

import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '@/controllers/employee.controller';
import { requireAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/constants';
import {
  createEmployeeBodySchema,
  employeeIdParamsSchema,
  updateEmployeeBodySchema,
} from '@/schemas/employee.schema';
import { validateRequest } from '@/utils/validateRequest';

const employeeRoute = Router();
const employeeReadRoles = [UserRole.Admin, UserRole.Hr, UserRole.Dean, UserRole.DepartmentHead];
const employeeManagerRoles = [UserRole.Admin, UserRole.Hr];

employeeRoute.use(requireAuth);
employeeRoute.get('/', requireRole(...employeeReadRoles), listEmployees);
employeeRoute.post('/', requireRole(...employeeManagerRoles), validateRequest(createEmployeeBodySchema), createEmployee);
employeeRoute.get('/:id', requireRole(...employeeReadRoles), validateRequest(employeeIdParamsSchema, 'params'), getEmployee);
employeeRoute.patch(
  '/:id',
  requireRole(...employeeManagerRoles),
  validateRequest(employeeIdParamsSchema, 'params'),
  validateRequest(updateEmployeeBodySchema),
  updateEmployee,
);
employeeRoute.delete('/:id', requireRole(UserRole.Admin), validateRequest(employeeIdParamsSchema, 'params'), deleteEmployee);

export { employeeRoute };

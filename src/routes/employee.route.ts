import { Router } from 'express';

import {
  employeeDocumentRoles,
  getEmployeeDocumentStatus,
  getMyEmployeeDocumentStatus,
  recordEmployeeId,
  reviewEmployeeDocument,
} from '@/controllers/employee-document.controller';
import {
  employeeDocumentIdParamsSchema,
  employeeDocumentStatusParamsSchema,
  recordEmployeeIdBodySchema,
  reviewEmployeeDocumentBodySchema,
} from '@/schemas/employee-document.schema';
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
  employeeListQuerySchema,
  updateEmployeeBodySchema,
} from '@/schemas/employee.schema';
import { validateRequest } from '@/utils/validateRequest';

const employeeRoute = Router();
const employeeReadRoles = [UserRole.Admin, UserRole.Hr, UserRole.Dean, UserRole.DepartmentHead];
const employeeManagerRoles = [UserRole.Admin, UserRole.Hr];

employeeRoute.use(requireAuth);
employeeRoute.get(
  '/me/document-status',
  requireRole(...employeeDocumentRoles.staff),
  getMyEmployeeDocumentStatus,
);
employeeRoute.get(
  '/:id/document-status',
  requireRole(...employeeDocumentRoles.reviewers),
  validateRequest(employeeDocumentIdParamsSchema, 'params'),
  getEmployeeDocumentStatus,
);
employeeRoute.post(
  '/:id/document-status/id-records',
  requireRole(...employeeDocumentRoles.reviewers),
  validateRequest(employeeDocumentIdParamsSchema, 'params'),
  validateRequest(recordEmployeeIdBodySchema),
  recordEmployeeId,
);
employeeRoute.patch(
  '/:id/document-status/:documentType',
  requireRole(...employeeDocumentRoles.reviewers),
  validateRequest(employeeDocumentStatusParamsSchema, 'params'),
  validateRequest(reviewEmployeeDocumentBodySchema),
  reviewEmployeeDocument,
);
employeeRoute.get(
  '/',
  requireRole(...employeeReadRoles),
  validateRequest(employeeListQuerySchema, 'query'),
  listEmployees,
);
employeeRoute.post(
  '/',
  requireRole(...employeeManagerRoles),
  validateRequest(createEmployeeBodySchema),
  createEmployee,
);
employeeRoute.get(
  '/:id',
  requireRole(...employeeReadRoles),
  validateRequest(employeeIdParamsSchema, 'params'),
  getEmployee,
);
employeeRoute.patch(
  '/:id',
  requireRole(...employeeManagerRoles),
  validateRequest(employeeIdParamsSchema, 'params'),
  validateRequest(updateEmployeeBodySchema),
  updateEmployee,
);
employeeRoute.delete(
  '/:id',
  requireRole(UserRole.Admin),
  validateRequest(employeeIdParamsSchema, 'params'),
  deleteEmployee,
);

export { employeeRoute };

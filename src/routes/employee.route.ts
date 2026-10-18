import { Router } from 'express';

import {
  confirmMyEmployeeDocumentUpload,
  createMyEmployeeDocumentUploadUrl,
  employeeDocumentRoles,
  getEmployeeDocumentDownloadUrl,
  getMyEmployeeDocumentDownloadUrl,
  listEmployeeDocuments,
  listMyEmployeeDocuments,
  reviewEmployeeDocument,
} from '@/controllers/employee-document.controller';
import {
  confirmEmployeeDocumentUploadBodySchema,
  createEmployeeDocumentUploadUrlBodySchema,
  employeeDocumentIdParamsSchema,
  employeeDocumentTypeOnlyParamsSchema,
  employeeDocumentTypeParamsSchema,
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
employeeRoute.post(
  '/me/documents/upload-url',
  requireRole(...employeeDocumentRoles.staff),
  validateRequest(createEmployeeDocumentUploadUrlBodySchema),
  createMyEmployeeDocumentUploadUrl,
);
employeeRoute.post(
  '/me/documents/confirm-upload',
  requireRole(...employeeDocumentRoles.staff),
  validateRequest(confirmEmployeeDocumentUploadBodySchema),
  confirmMyEmployeeDocumentUpload,
);
employeeRoute.get(
  '/me/documents',
  requireRole(...employeeDocumentRoles.staff),
  listMyEmployeeDocuments,
);
employeeRoute.get(
  '/me/documents/:documentType/download',
  requireRole(...employeeDocumentRoles.staff),
  validateRequest(employeeDocumentTypeOnlyParamsSchema, 'params'),
  getMyEmployeeDocumentDownloadUrl,
);
employeeRoute.get(
  '/:id/documents',
  requireRole(...employeeDocumentRoles.reviewers),
  validateRequest(employeeDocumentIdParamsSchema, 'params'),
  listEmployeeDocuments,
);
employeeRoute.get(
  '/:id/documents/:documentType/download',
  requireRole(...employeeDocumentRoles.reviewers),
  validateRequest(employeeDocumentTypeParamsSchema, 'params'),
  getEmployeeDocumentDownloadUrl,
);
employeeRoute.patch(
  '/:id/documents/:documentType/status',
  requireRole(...employeeDocumentRoles.reviewers),
  validateRequest(employeeDocumentTypeParamsSchema, 'params'),
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

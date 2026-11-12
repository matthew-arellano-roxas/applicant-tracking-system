import type { Request, RequestHandler } from 'express';
import type { z } from 'zod';
import { UserRole } from '@/constants';
import {
  employeeDocumentIdParamsSchema,
  employeeDocumentStatusParamsSchema,
  recordEmployeeIdBodySchema,
  reviewEmployeeDocumentBodySchema,
} from '@/schemas/employee-document.schema';
import { employeeDocumentService } from '@/services/employee-document.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const getRequester = (req: Request) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  return req.user;
};

export const getMyEmployeeDocumentStatus: RequestHandler = asyncHandler(async (req, res) => {
  const requester = getRequester(req);
  const employee = await employeeDocumentService.getEmployeeForUser(requester.id);
  const result = await employeeDocumentService.list(employee.id);
  return res.status(200).json(result);
});

export const getEmployeeDocumentStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof employeeDocumentIdParamsSchema>;
  const result = await employeeDocumentService.list(id);
  return res.status(200).json(result);
});

export const recordEmployeeId: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof employeeDocumentIdParamsSchema>;
  const body = req.body as z.output<typeof recordEmployeeIdBodySchema>;
  const result = await employeeDocumentService.recordId(id, body);
  return res.status(200).json({ message: 'In-person ID record saved', ...result });
});

export const reviewEmployeeDocument: RequestHandler = asyncHandler(async (req, res) => {
  const { id, documentType } = req.params as z.output<typeof employeeDocumentStatusParamsSchema>;
  const body = req.body as z.output<typeof reviewEmployeeDocumentBodySchema>;
  const status = await employeeDocumentService.review(id, documentType, body.status);
  return res.status(200).json({ status });
});

export const employeeDocumentRoles = {
  staff: [UserRole.Employee, UserRole.DepartmentHead, UserRole.Dean, UserRole.Hr, UserRole.Admin],
  reviewers: [UserRole.Hr, UserRole.Admin],
};

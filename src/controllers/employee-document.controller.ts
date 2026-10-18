import type { Request, RequestHandler } from 'express';
import type { z } from 'zod';
import { UserRole } from '@/constants';
import {
  confirmEmployeeDocumentUploadBodySchema,
  createEmployeeDocumentUploadUrlBodySchema,
  employeeDocumentIdParamsSchema,
  employeeDocumentTypeOnlyParamsSchema,
  employeeDocumentTypeParamsSchema,
  reviewEmployeeDocumentBodySchema,
} from '@/schemas/employee-document.schema';
import { employeeDocumentService } from '@/services/employee-document.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const getRequester = (req: Request) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  return req.user;
};

export const createMyEmployeeDocumentUploadUrl: RequestHandler = asyncHandler(async (req, res) => {
  const requester = getRequester(req);
  const employee = await employeeDocumentService.getEmployeeForUser(requester.id);
  const body = req.body as z.output<typeof createEmployeeDocumentUploadUrlBodySchema>;
  const authorization = await employeeDocumentService.createUploadAuthorization(
    employee.id,
    body.documentType,
    { mimeType: body.mimeType, size: body.size },
  );
  return res.status(200).json({
    message: 'Upload URL created. Upload directly to the signed URL, then confirm the upload.',
    bucket: authorization.bucket,
    path: authorization.path,
    signedUrl: authorization.signedUrl,
  });
});

export const confirmMyEmployeeDocumentUpload: RequestHandler = asyncHandler(async (req, res) => {
  const requester = getRequester(req);
  const employee = await employeeDocumentService.getEmployeeForUser(requester.id);
  const body = req.body as z.output<typeof confirmEmployeeDocumentUploadBodySchema>;
  const document = await employeeDocumentService.confirmUpload(
    employee.id,
    body.documentType,
    body.path,
  );
  return res.status(200).json({
    message: 'Employee document uploaded and marked pending review',
    document,
  });
});

export const listMyEmployeeDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const requester = getRequester(req);
  const employee = await employeeDocumentService.getEmployeeForUser(requester.id);
  const result = await employeeDocumentService.list(employee.id);
  return res.status(200).json(result);
});

export const listEmployeeDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof employeeDocumentIdParamsSchema>;
  const result = await employeeDocumentService.list(id);
  return res.status(200).json(result);
});

export const getEmployeeDocumentDownloadUrl: RequestHandler = asyncHandler(async (req, res) => {
  const { id, documentType } = req.params as z.output<typeof employeeDocumentTypeParamsSchema>;
  const signedUrl = await employeeDocumentService.getDownloadUrl(id, documentType);
  return res.status(200).json(signedUrl);
});

export const getMyEmployeeDocumentDownloadUrl: RequestHandler = asyncHandler(async (req, res) => {
  const requester = getRequester(req);
  const employee = await employeeDocumentService.getEmployeeForUser(requester.id);
  const { documentType } = req.params as z.output<typeof employeeDocumentTypeOnlyParamsSchema>;
  const signedUrl = await employeeDocumentService.getDownloadUrl(employee.id, documentType);
  return res.status(200).json(signedUrl);
});

export const reviewEmployeeDocument: RequestHandler = asyncHandler(async (req, res) => {
  const { id, documentType } = req.params as z.output<typeof employeeDocumentTypeParamsSchema>;
  const body = req.body as z.output<typeof reviewEmployeeDocumentBodySchema>;
  const status = await employeeDocumentService.review(id, documentType, body.status);
  return res.status(200).json({ status });
});

export const employeeDocumentRoles = {
  staff: [UserRole.Employee, UserRole.DepartmentHead, UserRole.Dean, UserRole.Hr, UserRole.Admin],
  reviewers: [UserRole.Hr, UserRole.Admin],
};

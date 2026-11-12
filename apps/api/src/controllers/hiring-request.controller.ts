import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import {
  createHiringRequestBodySchema,
  hiringRequestIdParamsSchema,
  hiringRequestListQuerySchema,
  updateHiringRequestBodySchema,
  updateHiringRequestStatusBodySchema,
} from '@/schemas/hiring-request.schema';
import {
  createHiringRequestService,
  type CreateHiringRequest,
} from '@/services/hiring-request.services';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiError } from '@/utils/ApiError';
import { UserRole } from '@/constants';

const hiringRequestService = createHiringRequestService(prisma);

const departmentHeadDepartmentId = async (userId: string) => {
  const employee = await prisma.employee.findFirst({ where: { userId }, select: { id: true } });
  if (!employee) throw ApiError.forbidden('No employee record is assigned to this department head');
  const department = await prisma.department.findFirst({ where: { departmentHeadId: employee.id }, select: { id: true } });
  if (!department) throw ApiError.forbidden('No department is assigned to this department head');
  return department.id;
};

const assertDepartmentHeadOwnsRequest = async (id: string, userId: string) => {
  const departmentId = await departmentHeadDepartmentId(userId);
  const request = await prisma.hiringRequest.findUnique({ where: { id }, select: { departmentId: true } });
  if (!request) throw ApiError.notFound('Hiring request not found');
  if (request.departmentId !== departmentId) throw ApiError.forbidden('You can only manage requests for your department');
};

export const listHiringRequests: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as z.output<typeof hiringRequestListQuerySchema>;
  if (req.user?.role === UserRole.DepartmentHead) {
    const departmentId = await departmentHeadDepartmentId(req.user.id);
    if (query.departmentId && query.departmentId !== departmentId) throw ApiError.forbidden('You can only view requests for your department');
    query.departmentId = departmentId;
  }
  const result = await hiringRequestService.list(query);
  return res.status(200).json({ hiringRequests: result.items, pagination: result.pagination });
});

export const getHiringRequest: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof hiringRequestIdParamsSchema>;
  if (req.user?.role === UserRole.DepartmentHead) await assertDepartmentHeadOwnsRequest(id, req.user.id);
  const hiringRequest = await hiringRequestService.get(id);
  return res.status(200).json({ hiringRequest });
});

export const createHiringRequest: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as z.output<typeof createHiringRequestBodySchema>;
  if (req.user?.role === UserRole.DepartmentHead && body.departmentId !== await departmentHeadDepartmentId(req.user.id)) {
    throw ApiError.forbidden('You can only create requests for your department');
  }
  const hiringRequest = await hiringRequestService.create(body as CreateHiringRequest);
  return res.status(201).json({ hiringRequest });
});

export const updateHiringRequest: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof hiringRequestIdParamsSchema>;
  if (req.user?.role === UserRole.DepartmentHead) await assertDepartmentHeadOwnsRequest(id, req.user.id);
  const body = req.body as z.output<typeof updateHiringRequestBodySchema>;
  const hiringRequest = await hiringRequestService.update(id, body as Partial<Omit<CreateHiringRequest, 'departmentId'>>);
  return res.status(200).json({ hiringRequest });
});

export const updateHiringRequestStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof hiringRequestIdParamsSchema>;
  const { status } = req.body as z.output<typeof updateHiringRequestStatusBodySchema>;
  if (req.user?.role === UserRole.DepartmentHead) {
    await assertDepartmentHeadOwnsRequest(id, req.user.id);
    if (status !== 'PENDING' && status !== 'CANCELLED') throw ApiError.forbidden('Department heads may submit or cancel their own requests only');
  }
  const hiringRequest = await hiringRequestService.setStatus(id, status);
  return res.status(200).json({ hiringRequest });
});

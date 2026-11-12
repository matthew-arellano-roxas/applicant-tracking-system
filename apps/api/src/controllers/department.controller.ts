import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import { createDepartmentService } from '@/services/department.service';
import {
  addDepartmentMemberBodySchema,
  assignDepartmentHeadBodySchema,
  createDepartmentBodySchema,
  departmentIdParamsSchema,
  departmentListQuerySchema,
  departmentMemberListQuerySchema,
  departmentMemberParamsSchema,
  updateDepartmentBodySchema,
} from '@/schemas/department.schema';
import { asyncHandler } from '@/utils/asyncHandler';

const departmentService = createDepartmentService(prisma);

export const listDepartments: RequestHandler = asyncHandler(async (req, res) => {
  const pagination = req.query as unknown as z.output<typeof departmentListQuerySchema>;
  const result = await departmentService.listDepartments(pagination);
  return res.status(200).json({ departments: result.items, pagination: result.pagination });
});

export const getDepartment: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const department = await departmentService.getDepartmentById(id);
  return res.status(200).json({ department });
});

export const createDepartment: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as z.output<typeof createDepartmentBodySchema>;
  const department = await departmentService.createDepartment(body);
  return res.status(201).json({ department });
});

export const updateDepartment: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const body = req.body as z.output<typeof updateDepartmentBodySchema>;
  const department = await departmentService.updateDepartment(id, body);
  return res.status(200).json({ department });
});

export const deleteDepartment: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const department = await departmentService.deleteDepartment(id);
  return res.status(200).json({ message: 'Department deleted', department });
});

export const listDepartmentMembers: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const pagination = req.query as unknown as z.output<typeof departmentMemberListQuerySchema>;
  const result = await departmentService.listMembers(id, pagination);
  return res.status(200).json({ members: result.items, pagination: result.pagination });
});

export const addDepartmentMember: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const { employeeId } = req.body as z.output<typeof addDepartmentMemberBodySchema>;
  const member = await departmentService.addMember(id, employeeId);
  return res.status(201).json({ member });
});

export const assignDepartmentHead: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const { employeeId } = req.body as z.output<typeof assignDepartmentHeadBodySchema>;
  const department = await departmentService.assignDepartmentHead(id, employeeId);
  return res.status(200).json({ message: 'Department head assigned', department });
});

export const removeDepartmentHead: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof departmentIdParamsSchema>;
  const department = await departmentService.removeDepartmentHead(id);
  return res.status(200).json({ message: 'Department head removed', department });
});

export const removeDepartmentMember: RequestHandler = asyncHandler(async (req, res) => {
  const { id, employeeId } = req.params as z.output<typeof departmentMemberParamsSchema>;
  const result = await departmentService.removeMember(id, employeeId);
  return res.status(200).json({ message: 'Department member removed', ...result });
});

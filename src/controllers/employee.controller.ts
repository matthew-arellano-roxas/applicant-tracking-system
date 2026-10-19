import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import { Prisma } from '@/generated/prisma/client';
import {
  createEmployeeBodySchema,
  employeeIdParamsSchema,
  employeeListQuerySchema,
  updateEmployeeBodySchema,
} from '@/schemas/employee.schema';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

export const listEmployees: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit, search, position, userId, departmentId, employmentType, isTeaching } =
    req.query as unknown as z.output<typeof employeeListQuerySchema>;
  const where: Prisma.EmployeeWhereInput = {
    ...(userId ? { userId } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(isTeaching === undefined ? {} : { isTeaching }),
    AND: [
      ...(departmentId
        ? [
            {
              OR: [
                { departmentMembers: { some: { departmentId } } },
                { departments: { some: { id: departmentId } } },
              ],
            },
          ]
        : []),
      ...(position ? [{ position: { contains: position, mode: 'insensitive' as const } }] : []),
      ...(search
        ? [
            {
              OR: [
                { position: { contains: search, mode: 'insensitive' as const } },
                { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
                { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
                { user: { email: { contains: search, mode: 'insensitive' as const } } },
              ],
            },
          ]
        : []),
    ],
  };
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        departments: true,
        departmentMembers: { include: { department: true } },
      },
      orderBy: { hiredAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where }),
  ]);
  return res.status(200).json({
    employees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getEmployee: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof employeeIdParamsSchema>;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      departments: true,
    },
  });
  if (!employee) throw ApiError.notFound('Employee not found');
  return res.status(200).json({ employee });
});

export const createEmployee: RequestHandler = asyncHandler(async (req, res) => {
  const { userId, position, employmentType, isTeaching, hiredAt, departmentIds } =
    req.body as z.output<typeof createEmployeeBodySchema>;

  const employee = await prisma.employee.create({
    data: {
      userId,
      position: position.trim(),
      employmentType: employmentType.trim(),
      isTeaching,
      ...(hiredAt === undefined ? {} : { hiredAt }),
      ...(departmentIds === undefined
        ? {}
        : { departments: { connect: departmentIds.map((id) => ({ id })) } }),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      departments: true,
    },
  });
  return res.status(201).json({ employee });
});

export const updateEmployee: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof employeeIdParamsSchema>;
  const { userId, position, employmentType, isTeaching, hiredAt, departmentIds } =
    req.body as z.output<typeof updateEmployeeBodySchema>;

  const existingEmployee = await prisma.employee.findUnique({ where: { id } });
  if (!existingEmployee) throw ApiError.notFound('Employee not found');

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(userId === undefined ? {} : { userId }),
      ...(position === undefined ? {} : { position: position.trim() }),
      ...(employmentType === undefined ? {} : { employmentType: employmentType.trim() }),
      ...(isTeaching === undefined ? {} : { isTeaching }),
      ...(hiredAt === undefined ? {} : { hiredAt }),
      ...(departmentIds === undefined
        ? {}
        : { departments: { set: departmentIds.map((departmentId) => ({ id: departmentId })) } }),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      departments: true,
    },
  });
  return res.status(200).json({ employee });
});

export const deleteEmployee: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof employeeIdParamsSchema>;
  const existingEmployee = await prisma.employee.findUnique({ where: { id } });
  if (!existingEmployee) throw ApiError.notFound('Employee not found');

  const employee = await prisma.employee.delete({ where: { id } });
  return res.status(200).json({ message: 'Employee deleted', employee });
});

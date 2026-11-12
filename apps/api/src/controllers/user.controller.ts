import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import { assignUserRoleBodySchema, assignUserRoleParamsSchema, userListQuerySchema } from '@/schemas/user.schema';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { getPaginationMetadata } from '@/utils/pagination';

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit, search, role } = req.query as unknown as z.output<typeof userListQuerySchema>;
  const where = {
    ...(role ? { role } : {}),
    ...(search ? { OR: [
    { email: { contains: search, mode: 'insensitive' as const } },
    { firstName: { contains: search, mode: 'insensitive' as const } },
    { lastName: { contains: search, mode: 'insensitive' as const } },
    ] } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: { id: true, firstName: true, lastName: true, email: true, role: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where }),
  ]);
  return res.status(200).json({ users, pagination: getPaginationMetadata({ page, limit }, total) });
});

export const assignUserRole: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof assignUserRoleParamsSchema>;
  const { role } = req.body as z.output<typeof assignUserRoleBodySchema>;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === role) throw ApiError.conflict(`User already has the ${role} role`);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role, updatedAt: new Date() },
  });

  return res.status(200).json({ message: 'User role assigned', user: updatedUser });
});

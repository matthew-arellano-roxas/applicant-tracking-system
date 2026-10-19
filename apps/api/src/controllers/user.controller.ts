import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import { assignUserRoleBodySchema, assignUserRoleParamsSchema } from '@/schemas/user.schema';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

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

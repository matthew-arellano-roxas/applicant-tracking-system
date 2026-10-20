import type { RequestHandler } from 'express';
import { prisma } from '@/configs';
import { asyncHandler } from '@/utils/asyncHandler';

export const listCampuses: RequestHandler = asyncHandler(async (_req, res) => {
  const campuses = await prisma.campus.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, location: true } });
  return res.status(200).json({ campuses });
});

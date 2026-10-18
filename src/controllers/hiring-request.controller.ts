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

const hiringRequestService = createHiringRequestService(prisma);

export const listHiringRequests: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as z.output<typeof hiringRequestListQuerySchema>;
  const hiringRequests = await hiringRequestService.list(query);
  return res.status(200).json({ hiringRequests });
});

export const getHiringRequest: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof hiringRequestIdParamsSchema>;
  const hiringRequest = await hiringRequestService.get(id);
  return res.status(200).json({ hiringRequest });
});

export const createHiringRequest: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as z.output<typeof createHiringRequestBodySchema>;
  const hiringRequest = await hiringRequestService.create(body as CreateHiringRequest);
  return res.status(201).json({ hiringRequest });
});

export const updateHiringRequest: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof hiringRequestIdParamsSchema>;
  const body = req.body as z.output<typeof updateHiringRequestBodySchema>;
  const hiringRequest = await hiringRequestService.update(id, body as Partial<Omit<CreateHiringRequest, 'departmentId'>>);
  return res.status(200).json({ hiringRequest });
});

export const updateHiringRequestStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof hiringRequestIdParamsSchema>;
  const { status } = req.body as z.output<typeof updateHiringRequestStatusBodySchema>;
  const hiringRequest = await hiringRequestService.setStatus(id, status);
  return res.status(200).json({ hiringRequest });
});

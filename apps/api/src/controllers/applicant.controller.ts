import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { prisma } from '@/configs';
import { UserRole } from '@/constants';
import {
  applicationIdParamsSchema,
  applicationListQuerySchema,
  createApplicationBodySchema,
  updateApplicationStatusBodySchema,
} from '@/schemas/applicant.schema';
import { createApplicantService } from '@/services/applicant.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const applications = createApplicantService(prisma);
const canManageApplications = (role: string): boolean =>
  role === UserRole.Admin || role === UserRole.Hr;

export const createApplication: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const { jobPostId } = req.body as z.output<typeof createApplicationBodySchema>;
  const application = await applications.createApplication({ userId: req.user.id, jobPostId });
  return res.status(202).json({
    message:
      application.scoreStatus === 'FAILED'
        ? 'Application received, but CV scoring could not be queued.'
        : 'Application received. CV scoring is queued.',
    application,
  });
});

export const listApplications: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as z.output<typeof applicationListQuerySchema>;
  const result = await applications.listApplications(query);
  return res.status(200).json({ applications: result.items, pagination: result.pagination });
});

export const listMyApplications: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const query = req.query as unknown as z.output<typeof applicationListQuerySchema>;
  const result = await applications.listApplications({ ...query, userId: req.user.id });
  return res.status(200).json({ applications: result.items, pagination: result.pagination });
});

export const getApplication: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const { id } = req.params as z.output<typeof applicationIdParamsSchema>;
  const application = await applications.getApplication(id);
  if (application.userId !== req.user.id && !canManageApplications(req.user.role)) {
    throw ApiError.forbidden('You cannot view this application');
  }
  return res.status(200).json({ application });
});

export const retryApplicationScoring: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const { id } = req.params as z.output<typeof applicationIdParamsSchema>;
  const application = await applications.getApplication(id);
  if (application.userId !== req.user.id && !canManageApplications(req.user.role)) {
    throw ApiError.forbidden('You cannot retry scoring for this application');
  }
  await applications.retryScoring(id);
  return res.status(202).json({
    message: 'CV scoring retry queued.',
    applicationId: id,
    scoreStatus: 'PENDING',
  });
});

export const updateApplicationStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof applicationIdParamsSchema>;
  const { status } = req.body as z.output<typeof updateApplicationStatusBodySchema>;
  const application = await applications.updateApplicationStatus(id, status);
  return res.status(200).json({ application });
});

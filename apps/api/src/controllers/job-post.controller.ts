import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import {
  createJobPostService,
  type CreateJobPost,
} from '@/services/job-post.services';
import {
  createJobPostBodySchema,
  jobPostIdParamsSchema,
  jobPostListQuerySchema,
  updateJobPostBodySchema,
  updateJobPostStatusBodySchema,
} from '@/schemas/job-post.schema';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const jobPostService = createJobPostService(prisma);

export const listJobPosts: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as z.output<typeof jobPostListQuerySchema>;
  const result = await jobPostService.list(query);
  return res.status(200).json({ jobPosts: result.items, pagination: result.pagination });
});

export const getJobPost: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof jobPostIdParamsSchema>;
  const jobPost = await jobPostService.get(id);
  return res.status(200).json({ jobPost });
});

export const createJobPost: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const body = req.body as z.output<typeof createJobPostBodySchema>;
  const jobPost = await jobPostService.create({
    ...body,
    approvedBy: req.user.id,
  } as CreateJobPost);
  return res.status(201).json({ jobPost });
});

export const updateJobPost: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof jobPostIdParamsSchema>;
  const body = req.body as z.output<typeof updateJobPostBodySchema>;
  const jobPost = await jobPostService.update(id, body);
  return res.status(200).json({ jobPost });
});

export const updateJobPostStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof jobPostIdParamsSchema>;
  const { status } = req.body as z.output<typeof updateJobPostStatusBodySchema>;
  const jobPost = await jobPostService.setStatus(id, status);
  return res.status(200).json({ jobPost });
});

export const deleteJobPost: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof jobPostIdParamsSchema>;
  await jobPostService.remove(id);
  return res.status(200).json({ message: 'Job post deleted' });
});

import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { prisma } from '@/configs';
import { UserRole } from '@/constants';
import {
  createInterviewBodySchema,
  interviewIdParamsSchema,
  interviewListQuerySchema,
  myInterviewListQuerySchema,
  updateInterviewBodySchema,
} from '@/schemas/interview.schema';
import { createInterviewService } from '@/services/interview.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const interviews = createInterviewService(prisma);
const canManageInterviews = (role: string): boolean =>
  role === UserRole.Admin || role === UserRole.Hr;

export const createInterview: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as z.output<typeof createInterviewBodySchema>;
  const result = await interviews.create(body);
  return res.status(201).json({
    message: 'Interview scheduled. Email queue status is included.',
    ...result,
  });
});

export const listInterviews: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as z.output<typeof interviewListQuerySchema>;
  const result = await interviews.list(query);
  return res.status(200).json({ interviews: result.items, pagination: result.pagination });
});

export const listMyInterviews: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  const query = req.query as unknown as z.output<typeof myInterviewListQuerySchema>;

  if (req.user.role === UserRole.Applicant) {
    const result = await interviews.list({ ...query, applicantUserId: req.user.id });
    return res.status(200).json({ interviews: result.items, pagination: result.pagination });
  }

  if (req.user.role === UserRole.Employee) {
    const result = await interviews.list({ ...query, interviewerId: req.user.id });
    return res.status(200).json({ interviews: result.items, pagination: result.pagination });
  }

  throw ApiError.forbidden('Only applicants and interviewers can view their own interviews');
});

export const getInterview: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const { id } = req.params as z.output<typeof interviewIdParamsSchema>;
  const interview = await interviews.get(id);
  const isOwner = interview.applicant.userId === req.user.id;
  const isAssignedInterviewer = interview.interviewerId === req.user.id;

  if (!canManageInterviews(req.user.role) && !isOwner && !isAssignedInterviewer) {
    throw ApiError.forbidden('You cannot view this interview');
  }

  return res.status(200).json({ interview });
});

export const updateInterview: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof interviewIdParamsSchema>;
  const body = req.body as z.output<typeof updateInterviewBodySchema>;
  const interview = await interviews.update(id, body);
  return res.status(200).json({ interview });
});

export const cancelInterview: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as z.output<typeof interviewIdParamsSchema>;
  const interview = await interviews.cancel(id);
  return res.status(200).json({ interview });
});

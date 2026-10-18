import { Router } from 'express';
import { UserRole } from '@/constants';
import {
  cancelInterview,
  createInterview,
  getInterview,
  listInterviews,
  listMyInterviews,
  updateInterview,
} from '@/controllers/interview.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import {
  createInterviewBodySchema,
  interviewIdParamsSchema,
  interviewListQuerySchema,
  myInterviewListQuerySchema,
  updateInterviewBodySchema,
} from '@/schemas/interview.schema';
import { validateRequest } from '@/utils/validateRequest';

const interviewRoute = Router();
const managers = [UserRole.Admin, UserRole.Hr];

interviewRoute.use(requireAuth);

interviewRoute.get(
  '/me',
  requireRole(UserRole.Applicant, UserRole.Employee),
  validateRequest(myInterviewListQuerySchema, 'query'),
  listMyInterviews,
);
interviewRoute.get(
  '/',
  requireRole(...managers),
  validateRequest(interviewListQuerySchema, 'query'),
  listInterviews,
);
interviewRoute.post(
  '/',
  requireRole(...managers),
  validateRequest(createInterviewBodySchema),
  createInterview,
);
interviewRoute.get(
  '/:id',
  requireRole(UserRole.Admin, UserRole.Hr, UserRole.Applicant, UserRole.Employee),
  validateRequest(interviewIdParamsSchema, 'params'),
  getInterview,
);
interviewRoute.patch(
  '/:id',
  requireRole(...managers),
  validateRequest(interviewIdParamsSchema, 'params'),
  validateRequest(updateInterviewBodySchema),
  updateInterview,
);
interviewRoute.patch(
  '/:id/cancel',
  requireRole(...managers),
  validateRequest(interviewIdParamsSchema, 'params'),
  cancelInterview,
);

export { interviewRoute };

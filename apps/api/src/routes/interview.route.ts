import { Router } from 'express';
import { UserRole } from '@/constants';
import {
  cancelInterview,
  completeInterview,
  createInterview,
  getInterview,
  getInterviewRubrics,
  listInterviewEvaluations,
  listInterviews,
  listMyInterviews,
  submitInterviewEvaluation,
  updateInterview,
} from '@/controllers/interview.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import {
  createInterviewBodySchema,
  interviewIdParamsSchema,
  interviewEvaluationBodySchema,
  interviewListQuerySchema,
  interviewRubricQuerySchema,
  myInterviewListQuerySchema,
  updateInterviewBodySchema,
} from '@/schemas/interview.schema';
import { validateRequest } from '@/utils/validateRequest';

const interviewRoute = Router();
const managers = [UserRole.Admin, UserRole.Hr];
const interviewers = [UserRole.Employee, UserRole.DepartmentHead, UserRole.Dean];

interviewRoute.use(requireAuth);

interviewRoute.get(
  '/me',
  requireRole(UserRole.Applicant, ...interviewers),
  validateRequest(myInterviewListQuerySchema, 'query'),
  listMyInterviews,
);
interviewRoute.get(
  '/',
  requireRole(...managers),
  validateRequest(interviewListQuerySchema, 'query'),
  listInterviews,
);
interviewRoute.get(
  '/rubrics',
  requireRole(...managers, ...interviewers),
  validateRequest(interviewRubricQuerySchema, 'query'),
  getInterviewRubrics,
);
interviewRoute.post(
  '/',
  requireRole(...managers),
  validateRequest(createInterviewBodySchema),
  createInterview,
);
interviewRoute.get(
  '/:id',
  requireRole(UserRole.Admin, UserRole.Hr, UserRole.Applicant, ...interviewers),
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
interviewRoute.get(
  '/:id/evaluations',
  requireRole(UserRole.Admin, UserRole.Hr, ...interviewers),
  validateRequest(interviewIdParamsSchema, 'params'),
  listInterviewEvaluations,
);
interviewRoute.post(
  '/:id/evaluations',
  requireRole(UserRole.Admin, UserRole.Hr, ...interviewers),
  validateRequest(interviewIdParamsSchema, 'params'),
  validateRequest(interviewEvaluationBodySchema),
  submitInterviewEvaluation,
);
interviewRoute.patch(
  '/:id/cancel',
  requireRole(...managers),
  validateRequest(interviewIdParamsSchema, 'params'),
  cancelInterview,
);
interviewRoute.patch(
  '/:id/complete',
  requireRole(...managers, ...interviewers),
  validateRequest(interviewIdParamsSchema, 'params'),
  completeInterview,
);

export { interviewRoute };

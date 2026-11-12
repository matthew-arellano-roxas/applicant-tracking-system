import { Router } from 'express';

import {
  createJobPost,
  deleteJobPost,
  getJobPost,
  listJobPosts,
  updateJobPost,
  updateJobPostStatus,
} from '@/controllers/job-post.controller';
import { requireAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/constants';
import {
  createJobPostBodySchema,
  jobPostIdParamsSchema,
  jobPostListQuerySchema,
  updateJobPostBodySchema,
  updateJobPostStatusBodySchema,
} from '@/schemas/job-post.schema';
import { validateRequest } from '@/utils/validateRequest';

const jobPostRoute = Router();
const jobPostReadRoles = Object.values(UserRole);
const jobPostManagerRoles = [UserRole.Admin, UserRole.Hr];

jobPostRoute.use(requireAuth);
jobPostRoute.get('/', requireRole(...jobPostReadRoles), validateRequest(jobPostListQuerySchema, 'query'), listJobPosts);
jobPostRoute.post('/', requireRole(...jobPostManagerRoles), validateRequest(createJobPostBodySchema), createJobPost);
jobPostRoute.get('/:id', requireRole(...jobPostReadRoles), validateRequest(jobPostIdParamsSchema, 'params'), getJobPost);
jobPostRoute.patch(
  '/:id',
  requireRole(...jobPostManagerRoles),
  validateRequest(jobPostIdParamsSchema, 'params'),
  validateRequest(updateJobPostBodySchema),
  updateJobPost,
);
jobPostRoute.patch(
  '/:id/status',
  requireRole(...jobPostManagerRoles),
  validateRequest(jobPostIdParamsSchema, 'params'),
  validateRequest(updateJobPostStatusBodySchema),
  updateJobPostStatus,
);
jobPostRoute.delete('/:id', requireRole(UserRole.Admin), validateRequest(jobPostIdParamsSchema, 'params'), deleteJobPost);

export { jobPostRoute };

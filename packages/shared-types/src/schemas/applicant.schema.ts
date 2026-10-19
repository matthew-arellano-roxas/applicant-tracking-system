import { z } from 'zod';
import { paginationQuerySchema } from './pagination.schema.js';
import { APPLICANT_STATUS } from '../constants/status.constant.js';

const nonEmptyString = z.string().trim().min(1);

export const createApplicationBodySchema = z.object({ jobPostId: nonEmptyString });
export const applicationIdParamsSchema = z.object({ id: nonEmptyString });
export const updateApplicationStatusBodySchema = z.object({
  status: z.enum(Object.values(APPLICANT_STATUS) as [string, ...string[]]),
});
export const applicationListQuerySchema = paginationQuerySchema
  .extend({
    jobPostId: nonEmptyString.optional(),
    status: z.enum(Object.values(APPLICANT_STATUS) as [string, ...string[]]).optional(),
    scoreStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
    search: nonEmptyString.optional(),
    minScore: z.coerce.number().min(0).max(100).optional(),
    maxScore: z.coerce.number().min(0).max(100).optional(),
  })
  .refine(
    (query) =>
      query.minScore === undefined ||
      query.maxScore === undefined ||
      query.minScore <= query.maxScore,
    {
      path: ['maxScore'],
      message: 'maxScore must be greater than or equal to minScore',
    },
  );

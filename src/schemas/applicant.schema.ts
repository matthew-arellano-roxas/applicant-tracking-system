import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';
import { APPLICANT_STATUS } from '@/constants/status.constant';

const nonEmptyString = z.string().trim().min(1);

export const createApplicationBodySchema = z.object({ jobPostId: nonEmptyString });
export const applicationIdParamsSchema = z.object({ id: nonEmptyString });
export const updateApplicationStatusBodySchema = z.object({
  status: z.enum(Object.values(APPLICANT_STATUS) as [string, ...string[]]),
});
export const applicationListQuerySchema = paginationQuerySchema.extend({
  jobPostId: nonEmptyString.optional(),
  status: nonEmptyString.optional(),
  scoreStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
});

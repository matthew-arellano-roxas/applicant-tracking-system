import { z } from 'zod';
import { paginationQuerySchema } from './pagination.schema.js';

const nonEmptyString = z.string().trim().min(1);
const salary = z.number().int().nonnegative().nullable();

export const jobPostStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const jobPostIdParamsSchema = z.object({ id: nonEmptyString });

export const jobPostListQuerySchema = paginationQuerySchema.extend({
  status: jobPostStatusSchema.optional(),
  search: nonEmptyString.optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'BOTH AVAILABLE']).optional(),
  departmentId: nonEmptyString.optional(),
  campusId: z.coerce.number().int().positive().optional(),
});

const jobPostFieldsSchema = z.object({
  hiringRequestId: nonEmptyString,
  title: nonEmptyString.optional(),
  description: z.string().nullable().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'BOTH AVAILABLE']).optional(),
  salaryMin: salary.optional(),
  salaryMax: salary.optional(),
});

export const createJobPostBodySchema = jobPostFieldsSchema;
export const updateJobPostBodySchema = jobPostFieldsSchema
  .omit({ hiringRequestId: true })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const updateJobPostStatusBodySchema = z.object({ status: jobPostStatusSchema });

import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);
const salary = z.number().int().nonnegative().nullable();

export const jobPostStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const jobPostIdParamsSchema = z.object({ id: nonEmptyString });

export const jobPostListQuerySchema = z.object({
  status: jobPostStatusSchema.optional(),
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

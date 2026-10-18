import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

const nonEmptyString = z.string().trim().min(1);

export const interviewStageSchema = z.enum([
  'HR_SCREENING',
  'DEPARTMENT',
  'DEMO_TEACHING',
  'FINAL',
]);
export const interviewTypeSchema = z.enum(['ONSITE', 'ONLINE', 'PHONE']);
export const interviewStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
export const interviewIdParamsSchema = z.object({ id: nonEmptyString });

export const createInterviewBodySchema = z.object({
  applicantId: nonEmptyString,
  interviewerId: nonEmptyString.nullable().optional(),
  stage: interviewStageSchema,
  date: z.coerce.date(),
  type: interviewTypeSchema,
  location: z.string().trim().max(255).nullable().optional(),
  instructions: z.string().trim().nullable().optional(),
});

export const updateInterviewBodySchema = z
  .object({
    interviewerId: nonEmptyString.nullable().optional(),
    stage: interviewStageSchema.optional(),
    date: z.coerce.date().optional(),
    type: interviewTypeSchema.optional(),
    status: interviewStatusSchema.optional(),
    location: z.string().trim().max(255).nullable().optional(),
    instructions: z.string().trim().nullable().optional(),
    notes: z.string().trim().nullable().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const interviewListQuerySchema = paginationQuerySchema.extend({
  applicantId: nonEmptyString.optional(),
  interviewerId: nonEmptyString.optional(),
  stage: interviewStageSchema.optional(),
  status: interviewStatusSchema.optional(),
});

export const myInterviewListQuerySchema = paginationQuerySchema;

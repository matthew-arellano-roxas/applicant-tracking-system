import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

const nonEmptyString = z.string().trim().min(1);

export const hiringRequestStatusSchema = z.enum([
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'FULFILLED',
  'CANCELLED',
]);

export const hiringRequestIdParamsSchema = z.object({ id: nonEmptyString });
export const hiringRequestListQuerySchema = paginationQuerySchema.extend({
  search: nonEmptyString.optional(),
  status: hiringRequestStatusSchema.optional(),
  departmentId: nonEmptyString.optional(),
  campusId: z.coerce.number().int().positive().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  isTeaching: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

const hiringRequestFieldsSchema = z.object({
  position: nonEmptyString,
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']),
  isTeaching: z.boolean(),
  requirements: z.record(z.string(), z.unknown()).optional(),
  departmentId: nonEmptyString,
  campusId: z.number().int().positive(),
});

export const createHiringRequestBodySchema = hiringRequestFieldsSchema;
export const updateHiringRequestBodySchema = hiringRequestFieldsSchema
  .omit({ departmentId: true })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const updateHiringRequestStatusBodySchema = z.object({
  status: hiringRequestStatusSchema,
});

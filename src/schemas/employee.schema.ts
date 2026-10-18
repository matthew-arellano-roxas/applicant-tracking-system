import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

const nonEmptyString = z.string().trim().min(1);

export const employeeIdParamsSchema = z.object({ id: nonEmptyString });
export const employeeListQuerySchema = paginationQuerySchema;

const employeeFieldsSchema = z.object({
  userId: nonEmptyString,
  position: nonEmptyString,
  employmentType: nonEmptyString,
  isTeaching: z.boolean(),
  hiredAt: z.coerce.date().optional(),
  departmentIds: z.array(nonEmptyString).optional(),
});

export const createEmployeeBodySchema = employeeFieldsSchema;
export const updateEmployeeBodySchema = employeeFieldsSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

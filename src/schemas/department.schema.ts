import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

const nonEmptyString = z.string().trim().min(1);
const departmentIdParamsSchema = z.object({ id: nonEmptyString });
export const departmentListQuerySchema = paginationQuerySchema.extend({
  name: nonEmptyString.optional(),
  search: nonEmptyString.optional(),
  departmentHeadId: nonEmptyString.optional(),
  hasDepartmentHead: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export const departmentMemberListQuerySchema = paginationQuerySchema.extend({
  employeeId: nonEmptyString.optional(),
  search: nonEmptyString.optional(),
  position: nonEmptyString.optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  isTeaching: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export { departmentIdParamsSchema };
export const departmentMemberParamsSchema = z.object({
  id: nonEmptyString,
  employeeId: nonEmptyString,
});

export const createDepartmentBodySchema = z.object({
  name: nonEmptyString,
  departmentHeadId: nonEmptyString.nullable().optional(),
});

export const updateDepartmentBodySchema = createDepartmentBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const addDepartmentMemberBodySchema = z.object({ employeeId: nonEmptyString });
export const assignDepartmentHeadBodySchema = z.object({ employeeId: nonEmptyString });

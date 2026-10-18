import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

const nonEmptyString = z.string().trim().min(1);
const departmentIdParamsSchema = z.object({ id: nonEmptyString });
export const departmentListQuerySchema = paginationQuerySchema;
export const departmentMemberListQuerySchema = paginationQuerySchema;

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

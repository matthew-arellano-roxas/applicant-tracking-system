import { z } from 'zod';
import { UserRole } from '../constants/roles.js';
import { paginationQuerySchema } from './pagination.schema.js';
const nonEmptyString = z.string().trim().min(1);
export const assignUserRoleParamsSchema = z.object({ id: nonEmptyString });
export const assignUserRoleBodySchema = z.object({ role: z.enum(UserRole) });
export const userListQuerySchema = paginationQuerySchema.extend({
    search: nonEmptyString.optional(),
    role: z.enum(UserRole).optional(),
});

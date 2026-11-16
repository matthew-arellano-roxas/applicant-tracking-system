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

export const updateCurrentUserBodySchema = z.object({
  firstName: nonEmptyString.optional(),
  lastName: nonEmptyString.optional(),
  email: z.email().transform((email) => email.trim().toLowerCase()).optional(),
  phoneNumber: z.string().trim().max(30).nullable().optional().transform((value) =>
    value === '' ? null : value,
  ),
  education: nonEmptyString.optional(),
}).refine((value) => Object.values(value).some((field) => field !== undefined), {
  message: 'Provide at least one profile field to update',
});

export const changeCurrentUserPasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

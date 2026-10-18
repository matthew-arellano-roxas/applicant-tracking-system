import { z } from 'zod';

import { UserRole } from '@/constants';

const nonEmptyString = z.string().trim().min(1);

export const assignUserRoleParamsSchema = z.object({ id: nonEmptyString });
export const assignUserRoleBodySchema = z.object({ role: z.enum(UserRole) });

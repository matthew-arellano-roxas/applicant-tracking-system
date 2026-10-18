import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerBodySchema = z.object({
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  education: nonEmptyString,
  phoneNumber: z.string().trim().nullable().optional(),
});

export const verifyOtpBodySchema = z.object({
  email: z.email().transform((email) => email.trim().toLowerCase()),
  otp: nonEmptyString,
});

export const refreshCookieSchema = z.object({ refresh_token: nonEmptyString });
export const accessCookieSchema = z.object({ access_token: nonEmptyString });

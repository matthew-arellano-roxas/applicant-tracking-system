import { z } from 'zod';

export const createCvUploadUrlBodySchema = z.object({
  mimeType: z.literal('application/pdf'),
  size: z.number().int().positive().max(5 * 1024 * 1024),
});

export const confirmCvUploadBodySchema = z.object({
  path: z.string().trim().min(1),
});

export const cvOwnerParamsSchema = z.object({
  userId: z.string().trim().min(1),
});

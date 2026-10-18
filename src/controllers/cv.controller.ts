import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { createStorageService } from '@/services/file-storage.service';
import {
  confirmCvUploadBodySchema,
  createCvUploadUrlBodySchema,
  cvOwnerParamsSchema,
} from '@/schemas/cv.schema';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const cvStorage = createStorageService({
  allowedMimeTypes: { 'application/pdf': 'pdf' },
});

export const createMyCvUploadUrl: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const file = req.body as z.output<typeof createCvUploadUrlBodySchema>;
  const authorization = await cvStorage.createUploadAuthorization(req.user.id, file);

  return res.status(200).json({
    message: 'Upload URL created. Upload the PDF directly to the returned signedUrl.',
    signedUrl: authorization.signedUrl,
    path: authorization.path,
  });
});

export const confirmMyCvUpload: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const { path } = req.body as z.output<typeof confirmCvUploadBodySchema>;
  const cv = await cvStorage.confirmUpload(req.user.id, path);

  return res.status(200).json({ message: 'CV upload confirmed successfully', cv });
});

export const getMyCvDownloadUrl: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const signedDownload = await cvStorage.getDownloadUrl(req.user, req.user.id);
  return res.status(200).json(signedDownload);
});

export const getCvDownloadUrl: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const { userId } = req.params as z.output<typeof cvOwnerParamsSchema>;
  const signedDownload = await cvStorage.getDownloadUrl(req.user, userId);
  return res.status(200).json(signedDownload);
});

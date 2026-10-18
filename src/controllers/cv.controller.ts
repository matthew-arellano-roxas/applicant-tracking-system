import type { RequestHandler } from 'express';
import { createStorageService } from '@/services/file-storage.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

const cvStorage = createStorageService({
  allowedMimeTypes: { 'application/pdf': 'pdf' },
});

export const uploadMyCv: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  if (!Buffer.isBuffer(req.body)) {
    throw ApiError.badRequest(
      'Send the PDF file as the raw request body with Content-Type application/pdf',
    );
  }

  const cv = await cvStorage.uploadPdf(req.user.id, req.body);
  return res.status(201).json({ message: 'CV uploaded successfully', cv });
});

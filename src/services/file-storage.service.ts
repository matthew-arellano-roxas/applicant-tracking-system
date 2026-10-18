import { randomUUID } from 'node:crypto';
import { supabase } from '@/configs/supabase';
import { prisma } from '@/configs/prisma';

export class StorageError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export interface Requester {
  id: string;
  role: string;
}

export interface StorageServiceConfig {
  bucket?: string;
  maxSizeBytes?: number;
  signedDownloadTtl?: number;
  canViewAnyRole?: string[];
  allowedMimeTypes?: Record<string, string>;
}

export interface StorageService {
  createUploadAuthorization: (
    userId: string,
    file: { mimeType: string; size: number },
  ) => Promise<{ bucket: string; path: string; token: string; signedUrl: string }>;

  confirmUpload: (
    userId: string,
    path: string,
  ) => Promise<{ id: string; path: string; mimeType: string; size: number; uploadedAt: Date }>;

  getDownloadUrl: (
    requester: Requester,
    ownerUserId: string,
  ) => Promise<{ url: string; expiresIn: number }>;

  delete: (requester: Requester, ownerUserId: string) => Promise<void>;
}

const DEFAULT_ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * Create a CV storage service with configurable bucket, limits, and permissions.
 * Handles the direct upload flow: authorize → upload → confirm → download/delete
 */
export function createStorageService(config: StorageServiceConfig = {}): StorageService {
  const bucket = config.bucket ?? 'cvs';
  const maxSizeBytes = config.maxSizeBytes ?? 5 * 1024 * 1024; // 5 MB
  const signedDownloadTtl = config.signedDownloadTtl ?? 60; // seconds
  const canViewAnyRole = config.canViewAnyRole ?? ['ADMIN', 'HR'];
  const allowedMimeTypes = config.allowedMimeTypes ?? DEFAULT_ALLOWED_TYPES;

  /**
   * Step 2: validate the request and create an upload authorization.
   * The frontend then calls:
   *   supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
   */
  async function createUploadAuthorization(
    userId: string,
    file: { mimeType: string; size: number },
  ) {
    const ext = allowedMimeTypes[file.mimeType];
    if (!ext) throw new StorageError('Only PDF, DOC and DOCX files are allowed');
    if (!Number.isInteger(file.size) || file.size <= 0 || file.size > maxSizeBytes) {
      throw new StorageError(`File must be between 1 byte and ${maxSizeBytes / 1024 / 1024} MB`);
    }

    // Server decides the path; the client never chooses it.
    const path = `${userId}/${randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) throw new StorageError('Could not create upload authorization', 500);

    return { bucket, path: data.path, token: data.token, signedUrl: data.signedUrl };
  }

  /**
   * Step 4: confirm the upload actually landed, then save path + metadata.
   * Replaces the user's previous CV (CV.user_id is unique).
   */
  async function confirmUpload(userId: string, path: string) {
    // Prevent claiming another user's file
    if (!path.startsWith(`${userId}/`)) throw new StorageError('Invalid file path', 403);

    const [folder, fileName] = path.split('/');
    const { data: objects, error } = await supabase.storage
      .from(bucket)
      .list(folder, { search: fileName, limit: 1 });
    if (error) throw new StorageError('Could not verify upload', 500);

    const object = objects?.find((o) => o.name === fileName);
    if (!object) throw new StorageError('File was not uploaded', 404);

    const size = Number(object.metadata?.size ?? 0);
    const mimeType = String(object.metadata?.mimetype ?? '');
    if (!allowedMimeTypes[mimeType] || size > maxSizeBytes) {
      // Uploaded something that doesn't meet the rules: remove it
      await supabase.storage.from(bucket).remove([path]);
      throw new StorageError('Uploaded file is not valid');
    }

    const previous = await prisma.cV.findUnique({ where: { user_id: userId } });

    const cv = await prisma.cV.upsert({
      where: { user_id: userId },
      create: { user_id: userId, file_url: path },
      update: { file_url: path, uploaded_at: new Date() },
    });

    // Clean up the replaced file (best effort)
    if (previous && previous.file_url !== path) {
      await supabase.storage.from(bucket).remove([previous.file_url]);
    }

    return { id: cv.id, path: cv.file_url, mimeType, size, uploadedAt: cv.uploaded_at };
  }

  /**
   * Step 5: authorize access and issue a short-lived signed download URL.
   * The browser downloads directly from Supabase.
   */
  async function getDownloadUrl(requester: Requester, ownerUserId: string) {
    const allowed = requester.id === ownerUserId || canViewAnyRole.includes(requester.role);
    if (!allowed) throw new StorageError('Forbidden', 403);

    const cv = await prisma.cV.findUnique({ where: { user_id: ownerUserId } });
    if (!cv) throw new StorageError('CV not found', 404);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cv.file_url, signedDownloadTtl);
    if (error || !data) throw new StorageError('Could not create download link', 500);

    return { url: data.signedUrl, expiresIn: signedDownloadTtl };
  }

  async function deleteCv(requester: Requester, ownerUserId: string) {
    if (!canViewAnyRole.includes(requester.role) && requester.id !== ownerUserId) {
      throw new StorageError('Forbidden', 403);
    }

    const cv = await prisma.cV.findUnique({ where: { user_id: ownerUserId } });
    if (!cv) return;

    await supabase.storage.from(bucket).remove([cv.file_url]);
    await prisma.cV.delete({ where: { user_id: ownerUserId } });
  }

  return {
    createUploadAuthorization,
    confirmUpload,
    getDownloadUrl,
    delete: deleteCv,
  };
}

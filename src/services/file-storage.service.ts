import { supabase } from '@/configs/supabase';

export const BUCKET = {
  CV: 'cvs',
  AVATAR: 'avatars',
  ID: 'valid-ids',
} as const;

export type BucketName = (typeof BUCKET)[keyof typeof BUCKET];

export interface UploadInput {
  bucket: BucketName;
  path: string;
  file: Buffer | Uint8Array;
  contentType: string;
}

export const uploadFile = async ({
  bucket,
  path,
  file,
  contentType,
}: UploadInput): Promise<string> => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
};

export const downloadFile = async (bucket: BucketName, path: string): Promise<Uint8Array> => {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Download failed: ${error?.message}`);
  return new Uint8Array(await data.arrayBuffer());
};

export const deleteFile = async (bucket: BucketName, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
};

export const getSignedUrl = async (
  bucket: BucketName,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) throw new Error(`Signed URL failed: ${error?.message}`);
  return data.signedUrl;
};

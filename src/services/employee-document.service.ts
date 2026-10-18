import { randomUUID } from 'node:crypto';
import { supabase } from '@/configs/supabase';
import { prisma } from '@/configs/prisma';
import { Prisma } from '@/generated/prisma/client';
import { ApiError } from '@/utils/ApiError';
import type { EmployeeDocumentType } from '@/schemas/employee-document.schema';

const BUCKET = 'employee-documents';
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
const FILE_FIELD = {
  VALID_ID: 'validIdPath',
  TIN: 'tinDocumentPath',
  SSS: 'sssDocumentPath',
  PHILHEALTH: 'philhealthDocumentPath',
  PAG_IBIG: 'pagIbigDocumentPath',
  MEDICAL_RECORD: 'medicalRecordPath',
  PSA: 'psaPath',
  BIR_FORM: 'birFormPath',
  NBI_CLEARANCE: 'nbiClearancePath',
  GOVERNMENT_NUMBER: 'governmentNumberPath',
} as const;
const STATUS_FIELD = {
  VALID_ID: 'validId',
  TIN: 'tin',
  SSS: 'sss',
  PHILHEALTH: 'philhealth',
  PAG_IBIG: 'pagIbig',
  MEDICAL_RECORD: 'medicalRecord',
  PSA: 'psa',
  BIR_FORM: 'birForm',
  NBI_CLEARANCE: 'nbiClearance',
  GOVERNMENT_NUMBER: 'governmentNumber',
} as const;

const getEmployee = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, userId: true },
  });
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
};

const getEmployeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findFirst({
    where: { userId },
    select: { id: true, userId: true },
  });
  if (!employee) throw ApiError.notFound('Employee record not found for this account');
  return employee;
};

const updateStatus = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  documentType: EmployeeDocumentType,
  status: 'pending' | 'complete',
) => {
  const statusData = {
    [STATUS_FIELD[documentType]]: status,
  } as Prisma.EmployeeDocumentStatusUpdateInput;
  await tx.employeeDocumentStatus.upsert({
    where: { employeeId },
    update: statusData,
    create: {
      employeeId,
      validId: 'pending',
      tin: 'pending',
      sss: 'pending',
      philhealth: 'pending',
      pagIbig: 'pending',
      medicalRecord: 'pending',
      psa: 'pending',
      nbiClearance: 'pending',
      governmentNumber: 'pending',
      ...statusData,
    } as Prisma.EmployeeDocumentStatusCreateInput,
  });
};

export const employeeDocumentService = {
  async createUploadAuthorization(
    employeeId: string,
    documentType: EmployeeDocumentType,
    file: { mimeType: string; size: number },
  ) {
    await getEmployee(employeeId);
    const extension = MIME_EXTENSIONS[file.mimeType];
    if (!extension) throw ApiError.badRequest('Only PDF, JPEG, and PNG files are allowed');
    if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_SIZE_BYTES) {
      throw ApiError.badRequest('File must be between 1 byte and 10 MB');
    }

    const path = `${employeeId}/${documentType}/${randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw ApiError.internal('Could not create upload authorization');
    return { bucket: BUCKET, path: data.path, signedUrl: data.signedUrl };
  },

  async confirmUpload(employeeId: string, documentType: EmployeeDocumentType, path: string) {
    await getEmployee(employeeId);
    const pathParts = path.split('/');
    if (
      pathParts.length !== 3 ||
      pathParts[0] !== employeeId ||
      pathParts[1] !== documentType ||
      !pathParts[2]
    ) {
      throw ApiError.forbidden('Invalid employee document path');
    }

    const { data: objects, error } = await supabase.storage
      .from(BUCKET)
      .list(`${employeeId}/${documentType}`, { search: pathParts[2], limit: 1 });
    if (error) throw ApiError.internal('Could not verify employee document upload');
    const object = objects?.find((item) => item.name === pathParts[2]);
    if (!object) throw ApiError.notFound('Uploaded file was not found');

    const mimeType = String(object.metadata?.mimetype ?? '');
    const sizeBytes = Number(object.metadata?.size ?? 0);
    if (!MIME_EXTENSIONS[mimeType] || sizeBytes <= 0 || sizeBytes > MAX_SIZE_BYTES) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw ApiError.badRequest('Uploaded file is not a supported document or exceeds 10 MB');
    }

    const fileField = FILE_FIELD[documentType];
    const previous = await prisma.employeeDocument.findUnique({
      where: { employeeId },
      select: { [fileField]: true },
    });
    const previousPath = previous?.[fileField] ?? null;
    const documentData = { [fileField]: path };

    await prisma.$transaction(async (tx) => {
      await tx.employeeDocument.upsert({
        where: { employeeId },
        update: documentData as Prisma.EmployeeDocumentUpdateInput,
        create: {
          employeeId,
          ...documentData,
        } as Prisma.EmployeeDocumentUncheckedCreateInput,
      });
      await updateStatus(tx, employeeId, documentType, 'pending');
    });

    if (previousPath && previousPath !== path) {
      const { error: removeError } = await supabase.storage.from(BUCKET).remove([previousPath]);
      if (removeError) console.error('Could not remove replaced employee document:', removeError);
    }

    return {
      employeeId,
      documentType,
      path,
      mimeType,
      size: sizeBytes,
      status: 'pending' as const,
    };
  },

  async list(employeeId: string) {
    await getEmployee(employeeId);
    const [documents, status] = await Promise.all([
      prisma.employeeDocument.findUnique({ where: { employeeId } }),
      prisma.employeeDocumentStatus.findUnique({ where: { employeeId } }),
    ]);
    return { documents, status };
  },

  async getDownloadUrl(employeeId: string, documentType: EmployeeDocumentType) {
    await getEmployee(employeeId);
    const field = FILE_FIELD[documentType];
    const document = await prisma.employeeDocument.findUnique({
      where: { employeeId },
      select: { [field]: true },
    });
    const path = document?.[field];
    if (!path) throw ApiError.notFound('Employee document not found');

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (error || !data) throw ApiError.internal('Could not create employee document download link');
    return { url: data.signedUrl, expiresIn: 60 };
  },

  async review(
    employeeId: string,
    documentType: EmployeeDocumentType,
    status: 'pending' | 'complete',
  ) {
    await getEmployee(employeeId);
    if (status === 'complete') {
      const fileField = FILE_FIELD[documentType];
      const document = await prisma.employeeDocument.findUnique({
        where: { employeeId },
        select: { [fileField]: true },
      });
      if (!document?.[fileField]) {
        throw ApiError.conflict('Upload the document before marking it complete');
      }
    }

    await prisma.$transaction((tx) => updateStatus(tx, employeeId, documentType, status));
    return { employeeId, documentType, status };
  },

  getEmployeeForUser,
};

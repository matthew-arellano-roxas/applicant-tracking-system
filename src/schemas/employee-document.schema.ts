import { z } from 'zod';

export const employeeDocumentTypeSchema = z.enum([
  'VALID_ID',
  'TIN',
  'SSS',
  'PHILHEALTH',
  'PAG_IBIG',
  'MEDICAL_RECORD',
  'PSA',
  'BIR_FORM',
  'NBI_CLEARANCE',
  'GOVERNMENT_NUMBER',
]);
export type EmployeeDocumentType = z.infer<typeof employeeDocumentTypeSchema>;

export const employeeDocumentStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const employeeDocumentIdParamsSchema = z.object({ id: z.string().trim().min(1) });
export const employeeDocumentTypeParamsSchema = z.object({
  id: z.string().trim().min(1),
  documentType: employeeDocumentTypeSchema,
});
export const employeeDocumentTypeOnlyParamsSchema = z.object({
  documentType: employeeDocumentTypeSchema,
});

export const createEmployeeDocumentUploadUrlBodySchema = z.object({
  documentType: employeeDocumentTypeSchema,
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});

export const confirmEmployeeDocumentUploadBodySchema = z.object({
  documentType: employeeDocumentTypeSchema,
  path: z.string().trim().min(1),
});

export const reviewEmployeeDocumentBodySchema = z.object({
  status: z.enum(['pending', 'complete']),
});

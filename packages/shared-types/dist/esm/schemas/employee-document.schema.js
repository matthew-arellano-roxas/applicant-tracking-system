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
]);
export const acceptedIdTypeSchema = z.enum([
    'PHILIPPINE_NATIONAL_ID',
    'PASSPORT',
    'DRIVERS_LICENSE',
    'UMID',
    'PRC_ID',
    'VOTERS_ID',
    'POSTAL_ID',
]);
export const employeeDocumentIdParamsSchema = z.object({ id: z.string().trim().min(1) });
export const employeeDocumentStatusParamsSchema = employeeDocumentIdParamsSchema.extend({
    documentType: employeeDocumentTypeSchema,
});
export const reviewEmployeeDocumentBodySchema = z.object({
    status: z.enum(['pending', 'complete']),
});
export const recordEmployeeIdBodySchema = z.object({
    idType: acceptedIdTypeSchema,
    notes: z.string().trim().max(500).optional(),
});

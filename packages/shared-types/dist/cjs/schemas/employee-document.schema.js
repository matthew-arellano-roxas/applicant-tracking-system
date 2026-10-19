"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordEmployeeIdBodySchema = exports.reviewEmployeeDocumentBodySchema = exports.employeeDocumentStatusParamsSchema = exports.employeeDocumentIdParamsSchema = exports.acceptedIdTypeSchema = exports.employeeDocumentTypeSchema = void 0;
const zod_1 = require("zod");
exports.employeeDocumentTypeSchema = zod_1.z.enum([
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
exports.acceptedIdTypeSchema = zod_1.z.enum([
    'PHILIPPINE_NATIONAL_ID',
    'PASSPORT',
    'DRIVERS_LICENSE',
    'UMID',
    'PRC_ID',
    'VOTERS_ID',
    'POSTAL_ID',
]);
exports.employeeDocumentIdParamsSchema = zod_1.z.object({ id: zod_1.z.string().trim().min(1) });
exports.employeeDocumentStatusParamsSchema = exports.employeeDocumentIdParamsSchema.extend({
    documentType: exports.employeeDocumentTypeSchema,
});
exports.reviewEmployeeDocumentBodySchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'complete']),
});
exports.recordEmployeeIdBodySchema = zod_1.z.object({
    idType: exports.acceptedIdTypeSchema,
    notes: zod_1.z.string().trim().max(500).optional(),
});

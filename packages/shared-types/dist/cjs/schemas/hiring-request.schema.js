"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHiringRequestStatusBodySchema = exports.updateHiringRequestBodySchema = exports.createHiringRequestBodySchema = exports.hiringRequestListQuerySchema = exports.hiringRequestIdParamsSchema = exports.hiringRequestStatusSchema = void 0;
const zod_1 = require("zod");
const pagination_schema_js_1 = require("./pagination.schema.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
exports.hiringRequestStatusSchema = zod_1.z.enum([
    'DRAFT',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'FULFILLED',
    'CANCELLED',
]);
exports.hiringRequestIdParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.hiringRequestListQuerySchema = pagination_schema_js_1.paginationQuerySchema.extend({
    search: nonEmptyString.optional(),
    status: exports.hiringRequestStatusSchema.optional(),
    departmentId: nonEmptyString.optional(),
    campusId: zod_1.z.coerce.number().int().positive().optional(),
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME']).optional(),
    isTeaching: zod_1.z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
});
const hiringRequestFieldsSchema = zod_1.z.object({
    position: nonEmptyString,
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME']),
    isTeaching: zod_1.z.boolean(),
    requirements: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    departmentId: nonEmptyString,
    campusId: zod_1.z.number().int().positive(),
});
exports.createHiringRequestBodySchema = hiringRequestFieldsSchema;
exports.updateHiringRequestBodySchema = hiringRequestFieldsSchema
    .omit({ departmentId: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'At least one field is required');
exports.updateHiringRequestStatusBodySchema = zod_1.z.object({
    status: exports.hiringRequestStatusSchema,
});

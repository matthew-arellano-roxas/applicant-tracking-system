"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobPostStatusBodySchema = exports.updateJobPostBodySchema = exports.createJobPostBodySchema = exports.jobPostListQuerySchema = exports.jobPostIdParamsSchema = exports.jobPostStatusSchema = void 0;
const zod_1 = require("zod");
const pagination_schema_js_1 = require("./pagination.schema.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
const salary = zod_1.z.number().int().nonnegative().nullable();
exports.jobPostStatusSchema = zod_1.z.enum(['OPEN', 'CLOSED']);
exports.jobPostIdParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.jobPostListQuerySchema = pagination_schema_js_1.paginationQuerySchema.extend({
    status: exports.jobPostStatusSchema.optional(),
    search: nonEmptyString.optional(),
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'BOTH AVAILABLE']).optional(),
    departmentId: nonEmptyString.optional(),
    campusId: zod_1.z.coerce.number().int().positive().optional(),
});
const jobPostFieldsSchema = zod_1.z.object({
    hiringRequestId: nonEmptyString,
    title: nonEmptyString.optional(),
    description: zod_1.z.string().nullable().optional(),
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'BOTH AVAILABLE']).optional(),
    salaryMin: salary.optional(),
    salaryMax: salary.optional(),
});
exports.createJobPostBodySchema = jobPostFieldsSchema;
exports.updateJobPostBodySchema = jobPostFieldsSchema
    .omit({ hiringRequestId: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'At least one field is required');
exports.updateJobPostStatusBodySchema = zod_1.z.object({ status: exports.jobPostStatusSchema });

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationListQuerySchema = exports.updateApplicationStatusBodySchema = exports.applicationIdParamsSchema = exports.createApplicationBodySchema = void 0;
const zod_1 = require("zod");
const pagination_schema_js_1 = require("./pagination.schema.js");
const status_constant_js_1 = require("../constants/status.constant.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
exports.createApplicationBodySchema = zod_1.z.object({ jobPostId: nonEmptyString });
exports.applicationIdParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.updateApplicationStatusBodySchema = zod_1.z.object({
    status: zod_1.z.enum(Object.values(status_constant_js_1.APPLICANT_STATUS)),
});
exports.applicationListQuerySchema = pagination_schema_js_1.paginationQuerySchema
    .extend({
    jobPostId: nonEmptyString.optional(),
    status: zod_1.z.enum(Object.values(status_constant_js_1.APPLICANT_STATUS)).optional(),
    scoreStatus: zod_1.z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
    search: nonEmptyString.optional(),
    minScore: zod_1.z.coerce.number().min(0).max(100).optional(),
    maxScore: zod_1.z.coerce.number().min(0).max(100).optional(),
})
    .refine((query) => query.minScore === undefined ||
    query.maxScore === undefined ||
    query.minScore <= query.maxScore, {
    path: ['maxScore'],
    message: 'maxScore must be greater than or equal to minScore',
});

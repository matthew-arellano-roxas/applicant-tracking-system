"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDepartmentHeadBodySchema = exports.addDepartmentMemberBodySchema = exports.updateDepartmentBodySchema = exports.createDepartmentBodySchema = exports.departmentMemberParamsSchema = exports.departmentIdParamsSchema = exports.departmentMemberListQuerySchema = exports.departmentListQuerySchema = void 0;
const zod_1 = require("zod");
const pagination_schema_js_1 = require("./pagination.schema.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
const departmentIdParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.departmentIdParamsSchema = departmentIdParamsSchema;
exports.departmentListQuerySchema = pagination_schema_js_1.paginationQuerySchema.extend({
    name: nonEmptyString.optional(),
    search: nonEmptyString.optional(),
    departmentHeadId: nonEmptyString.optional(),
    hasDepartmentHead: zod_1.z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
});
exports.departmentMemberListQuerySchema = pagination_schema_js_1.paginationQuerySchema.extend({
    employeeId: nonEmptyString.optional(),
    search: nonEmptyString.optional(),
    position: nonEmptyString.optional(),
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME']).optional(),
    isTeaching: zod_1.z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
});
exports.departmentMemberParamsSchema = zod_1.z.object({
    id: nonEmptyString,
    employeeId: nonEmptyString,
});
exports.createDepartmentBodySchema = zod_1.z.object({
    name: nonEmptyString,
    departmentHeadId: nonEmptyString.nullable().optional(),
});
exports.updateDepartmentBodySchema = exports.createDepartmentBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'At least one field is required');
exports.addDepartmentMemberBodySchema = zod_1.z.object({ employeeId: nonEmptyString });
exports.assignDepartmentHeadBodySchema = zod_1.z.object({ employeeId: nonEmptyString });

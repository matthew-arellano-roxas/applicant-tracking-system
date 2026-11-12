"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeBodySchema = exports.createEmployeeBodySchema = exports.employeeListQuerySchema = exports.employeeIdParamsSchema = void 0;
const zod_1 = require("zod");
const pagination_schema_js_1 = require("./pagination.schema.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
exports.employeeIdParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.employeeListQuerySchema = pagination_schema_js_1.paginationQuerySchema.extend({
    search: nonEmptyString.optional(),
    position: nonEmptyString.optional(),
    userId: nonEmptyString.optional(),
    departmentId: nonEmptyString.optional(),
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME']).optional(),
    isTeaching: zod_1.z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
});
const employeeFieldsSchema = zod_1.z.object({
    userId: nonEmptyString,
    position: nonEmptyString,
    employmentType: nonEmptyString,
    isTeaching: zod_1.z.boolean(),
    hiredAt: zod_1.z.coerce.date().optional(),
    departmentIds: zod_1.z.array(nonEmptyString).optional(),
});
exports.createEmployeeBodySchema = employeeFieldsSchema;
exports.updateEmployeeBodySchema = employeeFieldsSchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

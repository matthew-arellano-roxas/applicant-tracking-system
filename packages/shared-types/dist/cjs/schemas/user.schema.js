"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeCurrentUserPasswordBodySchema = exports.updateCurrentUserBodySchema = exports.userListQuerySchema = exports.assignUserRoleBodySchema = exports.assignUserRoleParamsSchema = void 0;
const zod_1 = require("zod");
const roles_js_1 = require("../constants/roles.js");
const pagination_schema_js_1 = require("./pagination.schema.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
exports.assignUserRoleParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.assignUserRoleBodySchema = zod_1.z.object({ role: zod_1.z.enum(roles_js_1.UserRole) });
exports.userListQuerySchema = pagination_schema_js_1.paginationQuerySchema.extend({
    search: nonEmptyString.optional(),
    role: zod_1.z.enum(roles_js_1.UserRole).optional(),
});
exports.updateCurrentUserBodySchema = zod_1.z.object({
    firstName: nonEmptyString.optional(),
    lastName: nonEmptyString.optional(),
    email: zod_1.z.email().transform((email) => email.trim().toLowerCase()).optional(),
    phoneNumber: zod_1.z.string().trim().max(30).nullable().optional().transform((value) => value === '' ? null : value),
    education: nonEmptyString.optional(),
}).refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one profile field to update',
});
exports.changeCurrentUserPasswordBodySchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});

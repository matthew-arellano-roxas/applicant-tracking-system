"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userListQuerySchema = exports.assignUserRoleBodySchema = exports.assignUserRoleParamsSchema = void 0;
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

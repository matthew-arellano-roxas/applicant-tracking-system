"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserResponseSchema = exports.currentUserSchema = exports.accessCookieSchema = exports.refreshCookieSchema = exports.verifyOtpBodySchema = exports.registerBodySchema = exports.loginBodySchema = void 0;
const zod_1 = require("zod");
const roles_js_1 = require("../constants/roles.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
exports.loginBodySchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(1),
});
exports.registerBodySchema = zod_1.z.object({
    firstName: nonEmptyString,
    lastName: nonEmptyString,
    email: zod_1.z.email().transform((email) => email.trim().toLowerCase()),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    education: nonEmptyString,
    phoneNumber: zod_1.z.string().trim().nullable().optional(),
});
exports.verifyOtpBodySchema = zod_1.z.object({
    email: zod_1.z.email().transform((email) => email.trim().toLowerCase()),
    otp: nonEmptyString,
});
exports.refreshCookieSchema = zod_1.z.object({ refresh_token: nonEmptyString });
exports.accessCookieSchema = zod_1.z.object({ access_token: nonEmptyString });
exports.currentUserSchema = zod_1.z.object({
    id: nonEmptyString,
    firstName: nonEmptyString,
    lastName: nonEmptyString,
    email: zod_1.z.email(),
    role: zod_1.z.enum(roles_js_1.UserRole),
});
exports.currentUserResponseSchema = zod_1.z.object({ user: exports.currentUserSchema });

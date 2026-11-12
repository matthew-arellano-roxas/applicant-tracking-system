"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cvOwnerParamsSchema = exports.confirmCvUploadBodySchema = exports.createCvUploadUrlBodySchema = void 0;
const zod_1 = require("zod");
exports.createCvUploadUrlBodySchema = zod_1.z.object({
    mimeType: zod_1.z.literal('application/pdf'),
    size: zod_1.z.number().int().positive().max(5 * 1024 * 1024),
});
exports.confirmCvUploadBodySchema = zod_1.z.object({
    path: zod_1.z.string().trim().min(1),
});
exports.cvOwnerParamsSchema = zod_1.z.object({
    userId: zod_1.z.string().trim().min(1),
});

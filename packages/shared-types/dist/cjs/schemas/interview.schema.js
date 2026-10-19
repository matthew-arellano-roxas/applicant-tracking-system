"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myInterviewListQuerySchema = exports.interviewListQuerySchema = exports.interviewEvaluationBodySchema = exports.updateInterviewBodySchema = exports.createInterviewBodySchema = exports.interviewRubricQuerySchema = exports.interviewIdParamsSchema = exports.interviewStatusSchema = exports.interviewTypeSchema = exports.interviewStageSchema = void 0;
const zod_1 = require("zod");
const interview_rubric_constant_js_1 = require("../constants/interview-rubric.constant.js");
const pagination_schema_js_1 = require("./pagination.schema.js");
const nonEmptyString = zod_1.z.string().trim().min(1);
const futureDate = zod_1.z.coerce
    .date()
    .refine((date) => date > new Date(), 'Date must be in the future');
const timeZone = zod_1.z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine((value) => {
    try {
        Intl.DateTimeFormat('en-US', { timeZone: value });
        return true;
    }
    catch {
        return false;
    }
}, 'Must be a valid IANA time zone');
const meetingUrl = zod_1.z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), 'Meeting URL must use HTTP or HTTPS');
exports.interviewStageSchema = zod_1.z.enum([
    'HR_SCREENING',
    'DEPARTMENT',
    'DEMO_TEACHING',
    'FINAL',
]);
exports.interviewTypeSchema = zod_1.z.enum(['ONSITE', 'ONLINE', 'PHONE']);
exports.interviewStatusSchema = zod_1.z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
exports.interviewIdParamsSchema = zod_1.z.object({ id: nonEmptyString });
exports.interviewRubricQuerySchema = zod_1.z.object({
    stage: exports.interviewStageSchema.optional(),
    roleType: zod_1.z.enum(['TEACHING', 'NON_TEACHING']).optional(),
});
exports.createInterviewBodySchema = zod_1.z
    .object({
    applicantId: nonEmptyString,
    interviewerId: nonEmptyString.nullable().optional(),
    stage: exports.interviewStageSchema,
    date: futureDate,
    durationMinutes: zod_1.z.number().int().min(15).max(480).default(60),
    timeZone: timeZone.default('Asia/Manila'),
    type: exports.interviewTypeSchema,
    location: zod_1.z.string().trim().max(255).nullable().optional(),
    meetingUrl: meetingUrl.nullable().optional(),
    instructions: zod_1.z.string().trim().nullable().optional(),
})
    .superRefine((body, ctx) => {
    if (body.type === 'ONLINE' && !body.meetingUrl) {
        ctx.addIssue({
            code: 'custom',
            path: ['meetingUrl'],
            message: 'Meeting URL is required for online interviews',
        });
    }
});
exports.updateInterviewBodySchema = zod_1.z
    .object({
    interviewerId: nonEmptyString.nullable().optional(),
    stage: exports.interviewStageSchema.optional(),
    date: futureDate.optional(),
    durationMinutes: zod_1.z.number().int().min(15).max(480).optional(),
    timeZone: timeZone.optional(),
    type: exports.interviewTypeSchema.optional(),
    status: zod_1.z.enum(['COMPLETED', 'NO_SHOW']).optional(),
    location: zod_1.z.string().trim().max(255).nullable().optional(),
    meetingUrl: meetingUrl.nullable().optional(),
    instructions: zod_1.z.string().trim().nullable().optional(),
    notes: zod_1.z.string().trim().nullable().optional(),
})
    .refine((body) => Object.keys(body).length > 0, 'At least one field is required');
const allowedRubricCriterionIds = new Set([
    ...interview_rubric_constant_js_1.INTERVIEW_RUBRICS.HR_SCREENING,
    ...interview_rubric_constant_js_1.INTERVIEW_RUBRICS.DEPARTMENT.TEACHING,
    ...interview_rubric_constant_js_1.INTERVIEW_RUBRICS.DEPARTMENT.NON_TEACHING,
    ...interview_rubric_constant_js_1.INTERVIEW_RUBRICS.DEMO_TEACHING,
    ...interview_rubric_constant_js_1.INTERVIEW_RUBRICS.FINAL.TEACHING,
    ...interview_rubric_constant_js_1.INTERVIEW_RUBRICS.FINAL.NON_TEACHING,
].map(({ id }) => id));
exports.interviewEvaluationBodySchema = zod_1.z.object({
    ratings: zod_1.z
        .record(zod_1.z.string().trim().min(1), zod_1.z.number().int().min(1).max(5))
        .refine((ratings) => Object.keys(ratings).length > 0, 'All rubric criteria must be rated')
        .superRefine((ratings, ctx) => {
        for (const criterionId of Object.keys(ratings)) {
            if (!allowedRubricCriterionIds.has(criterionId)) {
                ctx.addIssue({
                    code: 'custom',
                    path: [criterionId],
                    message: 'Unknown interview rubric criterion',
                });
            }
        }
    }),
    recommendation: zod_1.z.enum(['STRONG_YES', 'YES', 'HOLD', 'NO']),
    strengths: zod_1.z.string().trim().nullable().optional(),
    concerns: zod_1.z.string().trim().nullable().optional(),
    comments: zod_1.z.string().trim().nullable().optional(),
});
exports.interviewListQuerySchema = pagination_schema_js_1.paginationQuerySchema
    .extend({
    applicantId: nonEmptyString.optional(),
    interviewerId: nonEmptyString.optional(),
    stage: exports.interviewStageSchema.optional(),
    status: exports.interviewStatusSchema.optional(),
    type: exports.interviewTypeSchema.optional(),
    search: nonEmptyString.optional(),
    dateFrom: zod_1.z.coerce.date().optional(),
    dateTo: zod_1.z.coerce.date().optional(),
})
    .refine((query) => query.dateFrom === undefined || query.dateTo === undefined || query.dateFrom <= query.dateTo, {
    path: ['dateTo'],
    message: 'dateTo must be on or after dateFrom',
});
exports.myInterviewListQuerySchema = pagination_schema_js_1.paginationQuerySchema
    .extend({
    stage: exports.interviewStageSchema.optional(),
    status: exports.interviewStatusSchema.optional(),
    type: exports.interviewTypeSchema.optional(),
    search: nonEmptyString.optional(),
    dateFrom: zod_1.z.coerce.date().optional(),
    dateTo: zod_1.z.coerce.date().optional(),
})
    .refine((query) => query.dateFrom === undefined || query.dateTo === undefined || query.dateFrom <= query.dateTo, { path: ['dateTo'], message: 'dateTo must be on or after dateFrom' });

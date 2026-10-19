import { z } from 'zod';
import { INTERVIEW_RUBRICS } from '@/constants/interview-rubric.constant';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

const nonEmptyString = z.string().trim().min(1);
const futureDate = z.coerce
  .date()
  .refine((date) => date > new Date(), 'Date must be in the future');
const timeZone = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine((value) => {
    try {
      Intl.DateTimeFormat('en-US', { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, 'Must be a valid IANA time zone');
const meetingUrl = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'Meeting URL must use HTTP or HTTPS');

export const interviewStageSchema = z.enum([
  'HR_SCREENING',
  'DEPARTMENT',
  'DEMO_TEACHING',
  'FINAL',
]);
export const interviewTypeSchema = z.enum(['ONSITE', 'ONLINE', 'PHONE']);
export const interviewStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
export const interviewIdParamsSchema = z.object({ id: nonEmptyString });
export const interviewRubricQuerySchema = z.object({
  stage: interviewStageSchema.optional(),
  roleType: z.enum(['TEACHING', 'NON_TEACHING']).optional(),
});

export const createInterviewBodySchema = z
  .object({
    applicantId: nonEmptyString,
    interviewerId: nonEmptyString.nullable().optional(),
    stage: interviewStageSchema,
    date: futureDate,
    durationMinutes: z.number().int().min(15).max(480).default(60),
    timeZone: timeZone.default('Asia/Manila'),
    type: interviewTypeSchema,
    location: z.string().trim().max(255).nullable().optional(),
    meetingUrl: meetingUrl.nullable().optional(),
    instructions: z.string().trim().nullable().optional(),
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

export const updateInterviewBodySchema = z
  .object({
    interviewerId: nonEmptyString.nullable().optional(),
    stage: interviewStageSchema.optional(),
    date: futureDate.optional(),
    durationMinutes: z.number().int().min(15).max(480).optional(),
    timeZone: timeZone.optional(),
    type: interviewTypeSchema.optional(),
    status: z.enum(['COMPLETED', 'NO_SHOW']).optional(),
    location: z.string().trim().max(255).nullable().optional(),
    meetingUrl: meetingUrl.nullable().optional(),
    instructions: z.string().trim().nullable().optional(),
    notes: z.string().trim().nullable().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

const allowedRubricCriterionIds = new Set<string>(
  [
    ...INTERVIEW_RUBRICS.HR_SCREENING,
    ...INTERVIEW_RUBRICS.DEPARTMENT.TEACHING,
    ...INTERVIEW_RUBRICS.DEPARTMENT.NON_TEACHING,
    ...INTERVIEW_RUBRICS.DEMO_TEACHING,
    ...INTERVIEW_RUBRICS.FINAL.TEACHING,
    ...INTERVIEW_RUBRICS.FINAL.NON_TEACHING,
  ].map(({ id }) => id),
);

export const interviewEvaluationBodySchema = z.object({
  ratings: z
    .record(z.string().trim().min(1), z.number().int().min(1).max(5))
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
  recommendation: z.enum(['STRONG_YES', 'YES', 'HOLD', 'NO']),
  strengths: z.string().trim().nullable().optional(),
  concerns: z.string().trim().nullable().optional(),
  comments: z.string().trim().nullable().optional(),
});

export const interviewListQuerySchema = paginationQuerySchema
  .extend({
    applicantId: nonEmptyString.optional(),
    interviewerId: nonEmptyString.optional(),
    stage: interviewStageSchema.optional(),
    status: interviewStatusSchema.optional(),
    type: interviewTypeSchema.optional(),
    search: nonEmptyString.optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  })
  .refine(
    (query) =>
      query.dateFrom === undefined || query.dateTo === undefined || query.dateFrom <= query.dateTo,
    {
      path: ['dateTo'],
      message: 'dateTo must be on or after dateFrom',
    },
  );

export const myInterviewListQuerySchema = paginationQuerySchema
  .extend({
    stage: interviewStageSchema.optional(),
    status: interviewStatusSchema.optional(),
    type: interviewTypeSchema.optional(),
    search: nonEmptyString.optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  })
  .refine(
    (query) =>
      query.dateFrom === undefined || query.dateTo === undefined || query.dateFrom <= query.dateTo,
    { path: ['dateTo'], message: 'dateTo must be on or after dateFrom' },
  );

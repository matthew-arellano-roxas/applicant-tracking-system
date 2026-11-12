import { z } from 'zod';
export declare const interviewStageSchema: z.ZodEnum<{
    HR_SCREENING: "HR_SCREENING";
    DEPARTMENT: "DEPARTMENT";
    DEMO_TEACHING: "DEMO_TEACHING";
    FINAL: "FINAL";
}>;
export declare const interviewTypeSchema: z.ZodEnum<{
    ONSITE: "ONSITE";
    ONLINE: "ONLINE";
    PHONE: "PHONE";
}>;
export declare const interviewStatusSchema: z.ZodEnum<{
    COMPLETED: "COMPLETED";
    SCHEDULED: "SCHEDULED";
    CANCELLED: "CANCELLED";
    NO_SHOW: "NO_SHOW";
}>;
export declare const interviewIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const interviewRubricQuerySchema: z.ZodObject<{
    stage: z.ZodOptional<z.ZodEnum<{
        HR_SCREENING: "HR_SCREENING";
        DEPARTMENT: "DEPARTMENT";
        DEMO_TEACHING: "DEMO_TEACHING";
        FINAL: "FINAL";
    }>>;
    roleType: z.ZodOptional<z.ZodEnum<{
        TEACHING: "TEACHING";
        NON_TEACHING: "NON_TEACHING";
    }>>;
}, z.core.$strip>;
export declare const createInterviewBodySchema: z.ZodObject<{
    applicantId: z.ZodString;
    interviewerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    stage: z.ZodEnum<{
        HR_SCREENING: "HR_SCREENING";
        DEPARTMENT: "DEPARTMENT";
        DEMO_TEACHING: "DEMO_TEACHING";
        FINAL: "FINAL";
    }>;
    date: z.ZodCoercedDate<unknown>;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
    timeZone: z.ZodDefault<z.ZodString>;
    type: z.ZodEnum<{
        ONSITE: "ONSITE";
        ONLINE: "ONLINE";
        PHONE: "PHONE";
    }>;
    location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    meetingUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateInterviewBodySchema: z.ZodObject<{
    interviewerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    stage: z.ZodOptional<z.ZodEnum<{
        HR_SCREENING: "HR_SCREENING";
        DEPARTMENT: "DEPARTMENT";
        DEMO_TEACHING: "DEMO_TEACHING";
        FINAL: "FINAL";
    }>>;
    date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    durationMinutes: z.ZodOptional<z.ZodNumber>;
    timeZone: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        ONSITE: "ONSITE";
        ONLINE: "ONLINE";
        PHONE: "PHONE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        COMPLETED: "COMPLETED";
        NO_SHOW: "NO_SHOW";
    }>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    meetingUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const interviewEvaluationBodySchema: z.ZodObject<{
    ratings: z.ZodRecord<z.ZodString, z.ZodNumber>;
    recommendation: z.ZodEnum<{
        STRONG_YES: "STRONG_YES";
        YES: "YES";
        HOLD: "HOLD";
        NO: "NO";
    }>;
    strengths: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    concerns: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comments: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const interviewListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    applicantId: z.ZodOptional<z.ZodString>;
    interviewerId: z.ZodOptional<z.ZodString>;
    stage: z.ZodOptional<z.ZodEnum<{
        HR_SCREENING: "HR_SCREENING";
        DEPARTMENT: "DEPARTMENT";
        DEMO_TEACHING: "DEMO_TEACHING";
        FINAL: "FINAL";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        COMPLETED: "COMPLETED";
        SCHEDULED: "SCHEDULED";
        CANCELLED: "CANCELLED";
        NO_SHOW: "NO_SHOW";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        ONSITE: "ONSITE";
        ONLINE: "ONLINE";
        PHONE: "PHONE";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    dateTo: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export declare const myInterviewListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    stage: z.ZodOptional<z.ZodEnum<{
        HR_SCREENING: "HR_SCREENING";
        DEPARTMENT: "DEPARTMENT";
        DEMO_TEACHING: "DEMO_TEACHING";
        FINAL: "FINAL";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        COMPLETED: "COMPLETED";
        SCHEDULED: "SCHEDULED";
        CANCELLED: "CANCELLED";
        NO_SHOW: "NO_SHOW";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        ONSITE: "ONSITE";
        ONLINE: "ONLINE";
        PHONE: "PHONE";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    dateTo: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;

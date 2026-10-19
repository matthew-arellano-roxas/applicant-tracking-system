import { z } from 'zod';
export declare const jobPostStatusSchema: z.ZodEnum<{
    OPEN: "OPEN";
    CLOSED: "CLOSED";
}>;
export declare const jobPostIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const jobPostListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        OPEN: "OPEN";
        CLOSED: "CLOSED";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
        "BOTH AVAILABLE": "BOTH AVAILABLE";
    }>>;
    departmentId: z.ZodOptional<z.ZodString>;
    campusId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const createJobPostBodySchema: z.ZodObject<{
    hiringRequestId: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
        "BOTH AVAILABLE": "BOTH AVAILABLE";
    }>>;
    salaryMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    salaryMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateJobPostBodySchema: z.ZodObject<{
    employmentType: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
        "BOTH AVAILABLE": "BOTH AVAILABLE";
    }>>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    salaryMin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    salaryMax: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, z.core.$strip>;
export declare const updateJobPostStatusBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        OPEN: "OPEN";
        CLOSED: "CLOSED";
    }>;
}, z.core.$strip>;

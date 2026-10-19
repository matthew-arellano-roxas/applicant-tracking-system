import { z } from 'zod';
export declare const createApplicationBodySchema: z.ZodObject<{
    jobPostId: z.ZodString;
}, z.core.$strip>;
export declare const applicationIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const updateApplicationStatusBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        [x: string]: string;
    }>;
}, z.core.$strip>;
export declare const applicationListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    jobPostId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    scoreStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        COMPLETED: "COMPLETED";
        FAILED: "FAILED";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    minScore: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxScore: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;

import { z } from 'zod';
export declare const hiringRequestStatusSchema: z.ZodEnum<{
    REJECTED: "REJECTED";
    PENDING: "PENDING";
    CANCELLED: "CANCELLED";
    DRAFT: "DRAFT";
    APPROVED: "APPROVED";
    FULFILLED: "FULFILLED";
}>;
export declare const hiringRequestIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const hiringRequestListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        REJECTED: "REJECTED";
        PENDING: "PENDING";
        CANCELLED: "CANCELLED";
        DRAFT: "DRAFT";
        APPROVED: "APPROVED";
        FULFILLED: "FULFILLED";
    }>>;
    departmentId: z.ZodOptional<z.ZodString>;
    campusId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
    }>>;
    isTeaching: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
}, z.core.$strip>;
export declare const createHiringRequestBodySchema: z.ZodObject<{
    position: z.ZodString;
    employmentType: z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
    }>;
    isTeaching: z.ZodBoolean;
    requirements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    departmentId: z.ZodString;
    campusId: z.ZodNumber;
}, z.core.$strip>;
export declare const updateHiringRequestBodySchema: z.ZodObject<{
    position: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
    }>>;
    isTeaching: z.ZodOptional<z.ZodBoolean>;
    campusId: z.ZodOptional<z.ZodNumber>;
    requirements: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const updateHiringRequestStatusBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        REJECTED: "REJECTED";
        PENDING: "PENDING";
        CANCELLED: "CANCELLED";
        DRAFT: "DRAFT";
        APPROVED: "APPROVED";
        FULFILLED: "FULFILLED";
    }>;
}, z.core.$strip>;

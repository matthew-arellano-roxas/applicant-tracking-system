import { z } from 'zod';
export declare const employeeIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const employeeListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
    }>>;
    isTeaching: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
}, z.core.$strip>;
export declare const createEmployeeBodySchema: z.ZodObject<{
    userId: z.ZodString;
    position: z.ZodString;
    employmentType: z.ZodString;
    isTeaching: z.ZodBoolean;
    hiredAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    departmentIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateEmployeeBodySchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodString>;
    isTeaching: z.ZodOptional<z.ZodBoolean>;
    hiredAt: z.ZodOptional<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    departmentIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;

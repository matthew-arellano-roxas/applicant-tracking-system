import { z } from 'zod';
declare const departmentIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const departmentListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    name: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    departmentHeadId: z.ZodOptional<z.ZodString>;
    hasDepartmentHead: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
}, z.core.$strip>;
export declare const departmentMemberListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    employeeId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
    }>>;
    isTeaching: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
}, z.core.$strip>;
export { departmentIdParamsSchema };
export declare const departmentMemberParamsSchema: z.ZodObject<{
    id: z.ZodString;
    employeeId: z.ZodString;
}, z.core.$strip>;
export declare const createDepartmentBodySchema: z.ZodObject<{
    name: z.ZodString;
    departmentHeadId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateDepartmentBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    departmentHeadId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
export declare const addDepartmentMemberBodySchema: z.ZodObject<{
    employeeId: z.ZodString;
}, z.core.$strip>;
export declare const assignDepartmentHeadBodySchema: z.ZodObject<{
    employeeId: z.ZodString;
}, z.core.$strip>;

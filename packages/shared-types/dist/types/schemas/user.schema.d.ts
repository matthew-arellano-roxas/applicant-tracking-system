import { z } from 'zod';
export declare const assignUserRoleParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const assignUserRoleBodySchema: z.ZodObject<{
    role: z.ZodEnum<{
        readonly Admin: "ADMIN";
        readonly DepartmentHead: "DEPARTMENT_HEAD";
        readonly Dean: "DEAN";
        readonly Hr: "HUMAN_RESOURCE";
        readonly Applicant: "APPLICANT";
        readonly Employee: "EMPLOYEE";
    }>;
}, z.core.$strip>;
export declare const userListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        readonly Admin: "ADMIN";
        readonly DepartmentHead: "DEPARTMENT_HEAD";
        readonly Dean: "DEAN";
        readonly Hr: "HUMAN_RESOURCE";
        readonly Applicant: "APPLICANT";
        readonly Employee: "EMPLOYEE";
    }>>;
}, z.core.$strip>;

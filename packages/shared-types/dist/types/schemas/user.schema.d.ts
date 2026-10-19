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

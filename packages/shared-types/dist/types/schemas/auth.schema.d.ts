import { z } from 'zod';
export declare const loginBodySchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerBodySchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
    password: z.ZodString;
    education: z.ZodString;
    phoneNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const verifyOtpBodySchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
    otp: z.ZodString;
}, z.core.$strip>;
export declare const requestPasswordResetBodySchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
}, z.core.$strip>;
export declare const resetPasswordBodySchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
    otp: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshCookieSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, z.core.$strip>;
export declare const accessCookieSchema: z.ZodObject<{
    access_token: z.ZodString;
}, z.core.$strip>;
export declare const currentUserSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodEmail;
    role: z.ZodEnum<{
        readonly Admin: "ADMIN";
        readonly DepartmentHead: "DEPARTMENT_HEAD";
        readonly Dean: "DEAN";
        readonly Hr: "HUMAN_RESOURCE";
        readonly Applicant: "APPLICANT";
        readonly Employee: "EMPLOYEE";
    }>;
}, z.core.$strip>;
export declare const currentUserResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodEmail;
        role: z.ZodEnum<{
            readonly Admin: "ADMIN";
            readonly DepartmentHead: "DEPARTMENT_HEAD";
            readonly Dean: "DEAN";
            readonly Hr: "HUMAN_RESOURCE";
            readonly Applicant: "APPLICANT";
            readonly Employee: "EMPLOYEE";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CurrentUser = z.infer<typeof currentUserSchema>;

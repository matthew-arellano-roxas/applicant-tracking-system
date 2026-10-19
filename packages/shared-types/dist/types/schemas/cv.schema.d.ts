import { z } from 'zod';
export declare const createCvUploadUrlBodySchema: z.ZodObject<{
    mimeType: z.ZodLiteral<"application/pdf">;
    size: z.ZodNumber;
}, z.core.$strip>;
export declare const confirmCvUploadBodySchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strip>;
export declare const cvOwnerParamsSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;

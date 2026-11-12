import { z } from 'zod';
export declare const employeeDocumentTypeSchema: z.ZodEnum<{
    VALID_ID: "VALID_ID";
    TIN: "TIN";
    SSS: "SSS";
    PHILHEALTH: "PHILHEALTH";
    PAG_IBIG: "PAG_IBIG";
    MEDICAL_RECORD: "MEDICAL_RECORD";
    PSA: "PSA";
    BIR_FORM: "BIR_FORM";
    NBI_CLEARANCE: "NBI_CLEARANCE";
}>;
export type EmployeeDocumentType = z.infer<typeof employeeDocumentTypeSchema>;
export declare const acceptedIdTypeSchema: z.ZodEnum<{
    PHILIPPINE_NATIONAL_ID: "PHILIPPINE_NATIONAL_ID";
    PASSPORT: "PASSPORT";
    DRIVERS_LICENSE: "DRIVERS_LICENSE";
    UMID: "UMID";
    PRC_ID: "PRC_ID";
    VOTERS_ID: "VOTERS_ID";
    POSTAL_ID: "POSTAL_ID";
}>;
export type AcceptedIdType = z.infer<typeof acceptedIdTypeSchema>;
export declare const employeeDocumentIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const employeeDocumentStatusParamsSchema: z.ZodObject<{
    id: z.ZodString;
    documentType: z.ZodEnum<{
        VALID_ID: "VALID_ID";
        TIN: "TIN";
        SSS: "SSS";
        PHILHEALTH: "PHILHEALTH";
        PAG_IBIG: "PAG_IBIG";
        MEDICAL_RECORD: "MEDICAL_RECORD";
        PSA: "PSA";
        BIR_FORM: "BIR_FORM";
        NBI_CLEARANCE: "NBI_CLEARANCE";
    }>;
}, z.core.$strip>;
export declare const reviewEmployeeDocumentBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        pending: "pending";
        complete: "complete";
    }>;
}, z.core.$strip>;
export declare const recordEmployeeIdBodySchema: z.ZodObject<{
    idType: z.ZodEnum<{
        PHILIPPINE_NATIONAL_ID: "PHILIPPINE_NATIONAL_ID";
        PASSPORT: "PASSPORT";
        DRIVERS_LICENSE: "DRIVERS_LICENSE";
        UMID: "UMID";
        PRC_ID: "PRC_ID";
        VOTERS_ID: "VOTERS_ID";
        POSTAL_ID: "POSTAL_ID";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;

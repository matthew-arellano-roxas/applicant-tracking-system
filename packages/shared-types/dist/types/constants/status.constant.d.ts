export declare const APPLICANT_STATUS: {
    readonly APPLIED: "APPLIED";
    readonly SCREENED: "SCREENED";
    readonly SHORTLISTED: "SHORTLISTED";
    readonly INTERVIEW: "INTERVIEW";
    readonly REJECTED: "REJECTED";
    readonly HIRED: "HIRED";
};
export declare const JOB_POST_STATUS: {
    readonly OPEN: "OPEN";
    readonly CLOSED: "CLOSED";
};
export type ApplicantStatus = (typeof APPLICANT_STATUS)[keyof typeof APPLICANT_STATUS];

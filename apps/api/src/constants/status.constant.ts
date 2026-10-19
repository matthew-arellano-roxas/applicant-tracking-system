export const APPLICANT_STATUS = {
  APPLIED: 'APPLIED',
  SCREENED: 'SCREENED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  REJECTED: 'REJECTED',
  HIRED: 'HIRED',
} as const;

export const JOB_POST_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export type ApplicantStatus = (typeof APPLICANT_STATUS)[keyof typeof APPLICANT_STATUS];

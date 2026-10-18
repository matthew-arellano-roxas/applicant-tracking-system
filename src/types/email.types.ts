export type EmailData<T extends object = Record<string, unknown>> = {
  to: string;
  subject: string;
  text: string;
  templateData: T;
  templateFileName: string;
};

export type OtpPurpose = 'REGISTRATION' | 'FORGOT_PASSWORD';

// OTP template data
export interface OtpEmailTemplateData {
  name: string;
  otp: string;
  expiryMinutes: number;
  year: number;
  purpose: 'REGISTRATION' | 'FORGOT_PASSWORD';
}

// Optional specialized type for OTP emails
export type EmailContent = EmailData<OtpEmailTemplateData>;

export interface InterviewEmailTemplateData {
  name: string;
  jobTitle: string;
  interviewStage: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  interviewLocation: string;
  interviewInstructions: string;
  ctaUrl: string;
  year: number;
}

export interface InterviewInvitationInput {
  to: string;
  name: string;
  jobTitle: string;
  stage: string;
  type: string;
  date: Date;
  location?: string | null;
  instructions?: string | null;
  ctaUrl: string;
}

// Email Job Data ( for sending emails )
export type EmailJobData = EmailData<object>;

export interface ShortlistedEmailTemplateData {
  name: string;
  jobTitle: string;
  companyName: string;
  applicationReference: string;
  nextStep: string;
  ctaUrl: string;
  ctaText: string;
  senderName: string;
  year: number;
}

export interface ShortlistedInput {
  to: string;
  name: string;
  jobTitle: string;
  applicationReference: string;
  nextStep: string;
  ctaUrl: string;
}

export type EmailService = {
  extractCvDataFromRawText: (rawText: string) => Promise<string>;
};

export type ExtractedData = {
  contactInfo: ContactInfo;
  education: Array<string>;
  skills: Array<string>;
  yearsOfExperience: Array<string>; // Related Field Only
  certification: Array<string>;
};

export type ContactInfo = {
  name: string;
  phoneNumber: string;
  email: string;
};

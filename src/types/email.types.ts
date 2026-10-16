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

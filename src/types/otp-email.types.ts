export interface OtpEmailTemplateData {
  appName: string;
  name: string;
  otp: string;
  expiryMinutes: number;
  year: number;
}

export interface SendOtpEmailJobData {
  to: string;
  subject: string;
  templateData: OtpEmailTemplateData;
}

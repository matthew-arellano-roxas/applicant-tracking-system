import { transporter } from '@/configs/mail-transporter';
import { env } from '@/configs/env';
import { COMPANY } from '@/configs/company';
import { renderTemplate } from '@/utils/renderTemplate';
import { humanizeEnum } from '@/utils/humanizeEnum';
import { formatDate, formatTime } from '@/utils/formatDateTime';
import type {
  EmailData,
  InterviewEmailTemplateData,
  InterviewInvitationInput,
  OtpEmailTemplateData,
  OtpPurpose,
  ShortlistedEmailTemplateData,
  ShortlistedInput,
} from '@/types';

// Core sender (used by the worker)
export async function sendEmail<T extends object>(email: EmailData<T>) {
  const info = await transporter.sendMail({
    from: `"${COMPANY.name}" <${env.SMTP_USER}>`,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: renderTemplate(email.templateFileName, email.templateData),
  });

  return {
    status: 'Success' as const,
    message: info.messageId,
  };
}

// Interview invitation
const NOT_PROVIDED = 'To be announced';

const withFallback = (value?: string | null): string => value?.trim() || NOT_PROVIDED;

const buildSubject = (jobTitle: string, stage: string): string =>
  `Interview Invitation: ${humanizeEnum(stage)} - ${jobTitle}`;

const buildTemplateData = (input: InterviewInvitationInput): InterviewEmailTemplateData => ({
  name: input.name,
  jobTitle: input.jobTitle,
  interviewStage: humanizeEnum(input.stage),
  interviewDate: formatDate(input.date),
  interviewTime: formatTime(input.date),
  interviewType: humanizeEnum(input.type),
  interviewLocation: withFallback(input.location),
  interviewInstructions: input.instructions?.trim() ?? '',
  ctaUrl: input.ctaUrl,
  year: new Date().getFullYear(),
});

const buildPlainText = (data: InterviewEmailTemplateData): string =>
  [
    `Hi ${data.name},`,
    '',
    `You're invited to a ${data.interviewStage} interview for ${data.jobTitle}.`,
    '',
    `Date: ${data.interviewDate}`,
    `Time: ${data.interviewTime}`,
    `Type: ${data.interviewType}`,
    `Location: ${data.interviewLocation}`,
    ...(data.interviewInstructions ? ['', `Instructions: ${data.interviewInstructions}`] : []),
    '',
    `View details: ${data.ctaUrl}`,
    '',
    "If you can't make it, please reply to this email so we can reschedule.",
    `- ${COMPANY.emailSenderName}`,
  ].join('\n');

export const buildInterviewEmail = (
  input: InterviewInvitationInput,
): EmailData<InterviewEmailTemplateData> => {
  const templateData = buildTemplateData(input);
  return {
    to: input.to,
    subject: buildSubject(input.jobTitle, input.stage),
    text: buildPlainText(templateData),
    templateFileName: 'interview-invitation.html',
    templateData,
  };
};

// OTP (registration and forgot password)
export const OTP_EXPIRY_MINUTES = 5;

const getOtpMessage = (isRegistration: boolean): string =>
  isRegistration
    ? 'Use the one-time code below to complete your email verification.'
    : 'Use the one-time code below to verify your identity and reset your password.';

const getOtpSubject = (isRegistration: boolean): string =>
  isRegistration ? 'Verify Your Email Address' : 'Password Reset Verification';

const getOtpText = (name: string, message: string, otp: string, expiryMinutes: number): string =>
  [
    `Hi ${name},`,
    '',
    message,
    '',
    `Your OTP is ${otp}.`,
    `This code expires in ${expiryMinutes} minutes.`,
    '',
    "Never share this code with anyone. If you didn't request it, you can safely ignore this email.",
  ].join('\n');

export const buildOtpEmail = (
  to: string,
  name: string,
  purpose: OtpPurpose,
  otp: string,
): EmailData<OtpEmailTemplateData> => {
  const isRegistration = purpose === 'REGISTRATION';
  return {
    to,
    subject: getOtpSubject(isRegistration),
    text: getOtpText(name, getOtpMessage(isRegistration), otp, OTP_EXPIRY_MINUTES),
    templateFileName: 'otp-email.html',
    templateData: {
      name,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES,
      year: new Date().getFullYear(),
      purpose,
    },
  };
};

// Shortlisted
const buildShortlistedData = (input: ShortlistedInput): ShortlistedEmailTemplateData => ({
  name: input.name,
  jobTitle: input.jobTitle,
  companyName: COMPANY.name,
  applicationReference: input.applicationReference,
  nextStep: input.nextStep,
  ctaUrl: input.ctaUrl,
  ctaText: 'View application',
  senderName: COMPANY.emailSenderName,
  year: new Date().getFullYear(),
});

const buildShortlistedText = (data: ShortlistedEmailTemplateData): string =>
  [
    `Dear ${data.name},`,
    '',
    `You have been shortlisted for ${data.jobTitle} at ${data.companyName}.`,
    `Reference: ${data.applicationReference}`,
    '',
    data.nextStep,
    '',
    `View application: ${data.ctaUrl}`,
    `- ${data.senderName}`,
  ].join('\n');

export const buildShortlistedEmail = (
  input: ShortlistedInput,
): EmailData<ShortlistedEmailTemplateData> => {
  const templateData = buildShortlistedData(input);
  return {
    to: input.to,
    subject: `Shortlisted: ${input.jobTitle}`,
    text: buildShortlistedText(templateData),
    templateFileName: 'shortlisted-email.html',
    templateData,
  };
};

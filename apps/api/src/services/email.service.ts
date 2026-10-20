import { transporter } from '@/configs/mail-transporter';
import { env } from '@/configs/env';
import { COMPANY } from '@/configs/school';
import { renderTemplate } from '@/utils/renderTemplate';
import { humanizeEnum } from '@/utils/humanizeEnum';
import { formatDate, formatTime } from '@/utils/formatDateTime';
import type {
  EmailData,
  ApplicationStatusEmailInput,
  ApplicationStatusEmailTemplateData,
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

const buildSubject = (
  jobTitle: string,
  stage: string,
  isInterviewer: boolean,
  notificationKind: InterviewEmailTemplateData['notificationKind'],
): string => {
  const title =
    notificationKind === 'CANCELLED'
      ? 'Interview Cancelled'
      : notificationKind === 'UPDATED'
        ? 'Interview Details Updated'
        : isInterviewer
          ? 'Interview Assignment'
          : 'Interview Invitation';
  return `${title}: ${humanizeEnum(stage)} - ${jobTitle}`;
};

const buildTemplateData = (input: InterviewInvitationInput): InterviewEmailTemplateData => ({
  name: input.name,
  isInterviewer: input.recipientRole === 'INTERVIEWER',
  isUpdated: input.notificationKind === 'UPDATED',
  isCancelled: input.notificationKind === 'CANCELLED',
  applicantName: input.applicantName ?? '',
  notificationKind: input.notificationKind ?? 'SCHEDULED',
  jobTitle: input.jobTitle,
  interviewStage: humanizeEnum(input.stage),
  interviewDate: formatDate(input.date, input.timeZone),
  interviewTime: formatTime(input.date, input.timeZone),
  interviewType: humanizeEnum(input.type),
  interviewDuration: input.durationMinutes ?? 60,
  interviewTimeZone: input.timeZone ?? 'Asia/Manila',
  interviewLocation: withFallback(input.location),
  interviewMeetingUrl: input.meetingUrl?.trim() ?? '',
  interviewInstructions: input.instructions?.trim() ?? '',
  ctaUrl: input.ctaUrl,
  year: new Date().getFullYear(),
});

const buildPlainText = (data: InterviewEmailTemplateData): string =>
  [
    `Hi ${data.name},`,
    '',
    data.notificationKind === 'CANCELLED'
      ? `The ${data.interviewStage} interview for ${data.jobTitle} has been cancelled.`
      : data.notificationKind === 'UPDATED'
        ? `The ${data.interviewStage} interview for ${data.jobTitle} has been updated.`
        : data.isInterviewer
          ? `You have been assigned to interview ${data.applicantName} for ${data.jobTitle}.`
          : `You're invited to a ${data.interviewStage} interview for ${data.jobTitle}.`,
    '',
    ...(data.isInterviewer ? [`Applicant: ${data.applicantName}`] : []),
    `Date: ${data.interviewDate}`,
    `Time: ${data.interviewTime}`,
    `Duration: ${data.interviewDuration} minutes`,
    `Time zone: ${data.interviewTimeZone}`,
    `Type: ${data.interviewType}`,
    `Location: ${data.interviewLocation}`,
    ...(data.interviewMeetingUrl ? [`Meeting link: ${data.interviewMeetingUrl}`] : []),
    ...(data.interviewInstructions ? ['', `Instructions: ${data.interviewInstructions}`] : []),
    '',
    ...(data.ctaUrl ? [`View details: ${data.ctaUrl}`] : []),
    '',
    data.notificationKind === 'CANCELLED'
      ? 'Contact the recruitment team if you have questions.'
      : data.isInterviewer
        ? 'Please review the details and contact the recruitment team if you need to make changes.'
        : "If you can't make it, please reply to this email so we can reschedule.",
    `- ${COMPANY.emailSenderName}`,
  ].join('\n');

export const buildInterviewEmail = (
  input: InterviewInvitationInput,
): EmailData<InterviewEmailTemplateData> => {
  const templateData = buildTemplateData(input);
  return {
    to: input.to,
    subject: buildSubject(
      input.jobTitle,
      input.stage,
      templateData.isInterviewer,
      templateData.notificationKind,
    ),
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
      heading: isRegistration ? 'Verify your email' : 'Reset your password',
      message: getOtpMessage(isRegistration),
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

export const buildApplicationStatusEmail = (
  input: ApplicationStatusEmailInput,
): EmailData<ApplicationStatusEmailTemplateData> => {
  const applicationStatus = humanizeEnum(input.applicationStatus);
  const templateData: ApplicationStatusEmailTemplateData = {
    name: input.name,
    jobTitle: input.jobTitle,
    applicationStatus,
    applicationReference: input.applicationReference,
    companyName: COMPANY.name,
    ctaUrl: input.ctaUrl,
    senderName: COMPANY.emailSenderName,
    year: new Date().getFullYear(),
  };

  return {
    to: input.to,
    subject: `Application update: ${applicationStatus} - ${input.jobTitle}`,
    text: [
      `Dear ${input.name},`,
      '',
      `Your application for ${input.jobTitle} at ${COMPANY.name} is now ${applicationStatus}.`,
      `Application reference: ${input.applicationReference}`,
      '',
      'Sign in to the recruitment portal to view the latest details.',
      ...(input.ctaUrl ? ['', `View your applications: ${input.ctaUrl}`] : []),
      '',
      `- ${COMPANY.emailSenderName}`,
    ].join('\n'),
    templateFileName: 'application-status.html',
    templateData,
  };
};

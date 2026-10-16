import { transporter } from '@/configs';
import { env } from '@/configs/env';
import { renderTemplate } from '@/utils/renderTemplate';
import type {
  EmailData,
  OtpEmailTemplateData,
  OtpPurpose,
  InterviewEmailTemplateData,
  InterviewInvitationInput,
} from '@/types';
import { generateOtp } from '@/utils/generateOtp';
import { humanizeEnum } from '@/utils/humanizeEnum';
import { formatDate, formatTime } from '@/utils/formatDateTime';
import { COMPANY } from '@/configs/company';

export async function sendEmail<T extends object>(email: EmailData<T>) {
  const info = await transporter.sendMail({
    from: `"Bestlink College of the Philippines" <${env.SMTP_USER}>`,
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

// Interview Email
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

const buildInterviewEmail = (
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

export const sendInterviewInvitation = (input: InterviewInvitationInput) =>
  sendEmail(buildInterviewEmail(input));

// OTP (registration and forgot password)
function getOtpMessage(isRegistration: boolean): string {
  return isRegistration
    ? 'Use the one-time code below to complete your email verification.'
    : 'Use the one-time code below to verify your identity and reset your password.';
}

function getOtpSubject(isRegistration: boolean): string {
  return isRegistration ? 'Verify Your Email Address' : 'Password Reset Verification';
}

function getOtpText(name: string, message: string, otp: string, expiryMinutes: number): string {
  return [
    `Hi ${name},`,
    '',
    message,
    '',
    `Your OTP is ${otp}.`,
    `This code expires in ${expiryMinutes} minutes.`,
    '',
    "Never share this code with anyone. If you didn't request it, you can safely ignore this email.",
  ].join('\n');
}

export async function sendOtp(to: string, name: string, purpose: OtpPurpose): Promise<string> {
  const otp = generateOtp();
  const expiryMinutes = 5;
  const isRegistration = purpose === 'REGISTRATION';
  const message = getOtpMessage(isRegistration);

  const email: EmailData<OtpEmailTemplateData> = {
    to,
    subject: getOtpSubject(isRegistration),
    text: getOtpText(name, message, otp, expiryMinutes),
    templateFileName: 'otp-email.html',
    templateData: {
      name,
      otp,
      expiryMinutes,
      year: new Date().getFullYear(),
      purpose,
    },
  };

  await sendEmail(email);
  return otp;
}

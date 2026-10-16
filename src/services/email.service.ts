import { transporter } from '@/configs';
import { env } from '@/configs/env';
import { renderTemplate } from '@/utils/renderTemplate';
import type { EmailData, OtpEmailTemplateData, OtpPurpose } from '@/types';
import { generateOtp } from '@/utils/generateOtp';

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




// OTP
function getOtpMessage(isRegistration: boolean): string {
  return isRegistration
    ? 'Use the one-time code below to complete your email verification.'
    : 'Use the one-time code below to verify your identity and reset your password.';
}

function getOtpSubject(isRegistration: boolean): string {
  return isRegistration
    ? 'Verify Your Email Address'
    : 'Password Reset Verification';
}

function getOtpText(
  name: string,
  message: string,
  otp: string,
  expiryMinutes: number,
): string {
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

export async function sendOtp(
  to: string,
  name: string,
  purpose: OtpPurpose,
): Promise<string> {
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
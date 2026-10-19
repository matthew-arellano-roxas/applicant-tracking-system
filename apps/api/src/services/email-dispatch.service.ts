import { EMAIL_JOB } from '@/constants';
import { emailQueue } from '@/queues/email.queue';
import {
  buildInterviewEmail,
  buildOtpEmail,
  buildShortlistedEmail,
} from '@/services/email.service';
import { generateOtp } from '@/utils/generateOtp';
import type { EmailData, InterviewInvitationInput, OtpPurpose, ShortlistedInput } from '@/types';

export const enqueueEmail = <T extends object>(email: EmailData<T>) =>
  emailQueue.add(EMAIL_JOB.SEND, email);

export const enqueueInterviewInvitation = (input: InterviewInvitationInput) =>
  enqueueEmail(buildInterviewEmail(input));

export const enqueueShortlisted = (input: ShortlistedInput) =>
  enqueueEmail(buildShortlistedEmail(input));

export const enqueueOtp = async (
  to: string,
  name: string,
  purpose: OtpPurpose,
  requestedOtp?: string,
): Promise<string> => {
  const otp = requestedOtp ?? generateOtp();
  await enqueueEmail(buildOtpEmail(to, name, purpose, otp));
  return otp;
};

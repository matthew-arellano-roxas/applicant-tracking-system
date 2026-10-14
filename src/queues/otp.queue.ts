import { Queue } from 'bullmq';
import { queueConnection } from '../configs/queue';
import { OTP_QUEUE } from '../constants/queue.constant';

export interface OtpEmailJobData {
  to: string;
  name: string;
  appName: string;
  otp: string;
  expiryMinutes: number;
}

export interface OtpEmailJobResult {
  sent: boolean;
  messageId?: string;
}

export const otpQueue = new Queue<OtpEmailJobData, OtpEmailJobResult>(OTP_QUEUE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

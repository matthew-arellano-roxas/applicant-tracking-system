import { Queue } from 'bullmq';
import { queueConnection } from '../configs/queue';
import { SHORTLISTED_QUEUE } from '../constants/queue.constant';

export interface ShortlistedEmailJobData {
  to: string;
  name: string;
  jobTitle: string;
  companyName: string;
  nextStep: string;
  ctaUrl: string;
  ctaText: string;
  senderName: string;
}

export interface ShortlistedEmailJobResult {
  sent: boolean;
  messageId?: string;
}

export const shortlistedQueue = new Queue<
  ShortlistedEmailJobData,
  ShortlistedEmailJobResult
>(SHORTLISTED_QUEUE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

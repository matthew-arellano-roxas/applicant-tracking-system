// src/queues/email.queue.ts
import { Queue } from 'bullmq';
import { queueConnection } from '@/configs';
import { EMAIL_QUEUE } from '@/constants';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface EmailJobResult {
  sent: boolean;
  messageId?: string;
}

export const emailQueue = new Queue<EmailJobData, EmailJobResult>(EMAIL_QUEUE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

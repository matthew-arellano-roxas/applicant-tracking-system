// src/queues/email.queue.ts
import { Queue } from 'bullmq';
import { queueConnection } from '@/configs';
import { QUEUE } from '@/constants';

export const llmQueue = new Queue(QUEUE.LLM, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

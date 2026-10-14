// src/queues/email.queue.ts
import { Queue } from 'bullmq';
import { queueConnection } from '@/configs';
import { QUEUE } from '@/constants';

export const fileStorageQueue = new Queue(QUEUE.FILE_STORAGE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

import { Queue } from 'bullmq';
import { queueConnection } from '@/configs';
import { QUEUE } from '@/constants';

export const emailQueue = new Queue(QUEUE.EMAIL, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

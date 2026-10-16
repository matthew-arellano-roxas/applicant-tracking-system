import { Worker } from 'bullmq';
// import { env } from '../configs/env';
import { queueConnection } from '../configs/queue';
import { QUEUE } from '@/constants';

const worker = new Worker(
  QUEUE.LLM,
  async (_job) => {
    return {};
  },
  { connection: queueConnection, concurrency: 5 },
);

worker.on('completed', (job, result) => {
  console.log(`Email job ${job.id} sent: ${result.messageId}`);
});

worker.on('failed', (job, error) => {
  console.error(`Email job ${job?.id ?? 'unknown'} failed: ${error.message}`);
});

worker.on('error', (error) => {
  console.error('Email worker error:', error);
});

import { Worker, type Job } from 'bullmq';
import { queueConnection } from '@/configs/queue';
import { EMAIL_JOB, QUEUE } from '@/constants';
import { sendEmail } from '@/services/email.service';
import type { EmailJobData, WorkerResult } from '@/types';

type EmailWorker = Worker<EmailJobData, WorkerResult>;

const assertKnownJob = (name: string): void => {
  if (name !== EMAIL_JOB.SEND) throw new Error(`Unknown email job: ${name}`);
};

const processEmail = async (job: Job<EmailJobData>): Promise<WorkerResult> => {
  assertKnownJob(job.name);
  return sendEmail(job.data);
};

const attachListeners = (worker: EmailWorker): void => {
  worker.on('completed', (job, result) =>
    console.log(`Email job ${job.id} sent: ${result.message}`),
  );
  worker.on('failed', (job, error) =>
    console.error(`Email job ${job?.id ?? 'unknown'} failed: ${error.message}`),
  );
  worker.on('error', (error) => console.error('Email worker error:', error));
};

export const createEmailWorker = (): EmailWorker => {
  const worker = new Worker<EmailJobData, WorkerResult>(QUEUE.EMAIL, processEmail, {
    connection: queueConnection,
    concurrency: 5,
  });
  attachListeners(worker);
  return worker;
};
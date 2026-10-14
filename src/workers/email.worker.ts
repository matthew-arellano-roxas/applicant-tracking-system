import { Worker } from 'bullmq';
import { transporter } from '../configs/mail-transporter';
import { env } from '../configs/env';
import { queueConnection } from '../configs/queue';
import { EMAIL_QUEUE } from '../constants/queue.constant';
import type { EmailJobData, EmailJobResult } from '../queues/email.queue';

const worker = new Worker<EmailJobData, EmailJobResult>(
  EMAIL_QUEUE,
  async (job) => {
    const info = await transporter.sendMail({
      from: env.SMTP_USER,
      to: job.data.to,
      subject: job.data.subject,
      text: job.data.body,
    });

    return { sent: true, messageId: info.messageId };
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

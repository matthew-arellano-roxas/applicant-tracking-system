import { Worker } from 'bullmq';
import { transporter } from '../configs/mail-transporter';
import { env } from '../configs/env';
import { queueConnection } from '../configs/queue';
import { QUEUE } from '@/constants';
import { renderTemplate } from '../utils/renderTemplate';
import type { SendOtpEmailJobData } from '../types/otp-email.types';

const worker = new Worker<SendOtpEmailJobData>(
  QUEUE.EMAIL,
  async (job) => {
    switch (job.name) {
      case 'sendOtp':
        return await transporter.sendMail({
          from: env.SMTP_USER,
          to: job.data.to,
          subject: job.data.subject,
          html: renderTemplate('otp-email.html', job.data.templateData),
        });
    }
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

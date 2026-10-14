import { Worker } from 'bullmq';
import { env } from '../configs/env';
import { transporter } from '../configs/mail-transporter';
import { queueConnection } from '../configs/queue';
import { SHORTLISTED_QUEUE } from '../constants/queue.constant';
import type {
  ShortlistedEmailJobData,
  ShortlistedEmailJobResult,
} from '../queues/shortlisted.queue';
import { renderTemplate } from '../utils/renderTemplate';

const worker = new Worker<ShortlistedEmailJobData, ShortlistedEmailJobResult>(
  SHORTLISTED_QUEUE,
  async (job) => {
    const {
      to,
      name,
      jobTitle,
      companyName,
      nextStep,
      ctaUrl,
      ctaText,
      senderName,
    } = job.data;
    const html = renderTemplate('shortlisted-email.html', {
      name,
      jobTitle,
      companyName,
      nextStep,
      ctaUrl,
      ctaText,
      senderName,
      year: new Date().getFullYear(),
    });
    const info = await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: `You've been shortlisted for ${jobTitle}`,
      text: `Hi ${name}, you've been shortlisted for ${jobTitle} at ${companyName}. ${nextStep}`,
      html,
    });

    return { sent: true, messageId: info.messageId };
  },
  { connection: queueConnection, concurrency: 5 },
);

worker.on('completed', (job, result) => {
  console.log(`Shortlisted email job ${job.id} sent: ${result.messageId}`);
});

worker.on('failed', (job, error) => {
  console.error(`Shortlisted email job ${job?.id ?? 'unknown'} failed: ${error.message}`);
});

worker.on('error', (error) => {
  console.error('Shortlisted email worker error:', error);
});

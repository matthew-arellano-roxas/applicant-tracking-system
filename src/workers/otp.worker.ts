import { Worker } from 'bullmq';
import { env } from '../configs/env';
import { transporter } from '../configs/mail-transporter';
import { queueConnection } from '../configs/queue';
import { OTP_QUEUE } from '../constants/queue.constant';
import type { OtpEmailJobData, OtpEmailJobResult } from '../queues/otp.queue';
import { renderTemplate } from '../utils/renderTemplate';

const worker = new Worker<OtpEmailJobData, OtpEmailJobResult>(
  OTP_QUEUE,
  async (job) => {
    const { to, name, appName, otp, expiryMinutes } = job.data;
    const html = renderTemplate('otp-email.html', {
      name,
      appName,
      otp,
      expiryMinutes,
      year: new Date().getFullYear(),
    });
    const info = await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: `${appName} email verification`,
      text: `Hi ${name}, your ${appName} verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
      html,
    });

    return { sent: true, messageId: info.messageId };
  },
  { connection: queueConnection, concurrency: 5 },
);

worker.on('completed', (job, result) => {
  console.log(`OTP email job ${job.id} sent: ${result.messageId}`);
});

worker.on('failed', (job, error) => {
  console.error(`OTP email job ${job?.id ?? 'unknown'} failed: ${error.message}`);
});

worker.on('error', (error) => {
  console.error('OTP email worker error:', error);
});

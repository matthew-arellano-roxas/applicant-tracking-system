import nodemailer from 'nodemailer';
import { env } from './env';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // 587 for STARTTLS, 465 for SSL
  secure: false, // true only if you use port 465
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

import 'dotenv/config';

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  PORT: process.env.PORT,
};

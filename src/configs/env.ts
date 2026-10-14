import 'dotenv/config';

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  PORT: process.env.PORT,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
};

import 'dotenv/config';

export const env = {
  // Express
  PORT: process.env.PORT,
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  // Nodemailer
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  // Groq
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  // Supabase
  SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  // Json Web Token
  JWT_SECRET: process.env.JWT_SECRET,
};

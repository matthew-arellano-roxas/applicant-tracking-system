import 'dotenv/config';

export const env = {
  // Express
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  TRUST_PROXY_HOPS: process.env.TRUST_PROXY_HOPS,
  LOG_LEVEL: process.env.LOG_LEVEL,
  HTTP_CACHE_TTL_SECONDS: process.env.HTTP_CACHE_TTL_SECONDS,
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  // Redis
  REDIS_CACHE_URL: process.env.REDIS_CACHE_URL,
  REDIS_QUEUE_URL: process.env.REDIS_QUEUE_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  // Nodemailer
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  // Groq
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  // Supabase
  SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  // Json Web Token
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
};

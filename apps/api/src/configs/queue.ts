import 'dotenv/config';
import type { ConnectionOptions } from 'bullmq';

const queueUrl = process.env.REDIS_QUEUE_URL ? new URL(process.env.REDIS_QUEUE_URL) : undefined;

export const queueConnection: ConnectionOptions = queueUrl
  ? {
      host: queueUrl.hostname,
      port: Number(queueUrl.port || 6379),
      ...(queueUrl.username ? { username: decodeURIComponent(queueUrl.username) } : {}),
      ...(queueUrl.password ? { password: decodeURIComponent(queueUrl.password) } : {}),
      ...(queueUrl.pathname.length > 1 ? { db: Number(queueUrl.pathname.slice(1)) } : {}),
      ...(queueUrl.protocol === 'rediss:' ? { tls: {} } : {}),
    }
  : {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
    };

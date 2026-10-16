import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),

  base: {
    service: 'applicant-tracking-system',
    env: process.env.NODE_ENV ?? 'development',
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      'password',
      'confirmPassword',
      'req.body.password',
      'req.body.confirmPassword',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers.set-cookie',
      '*.accessToken',
      '*.refreshToken',
      '*.token',
      '*.otp',
    ],
    censor: '[REDACTED]',
  },

  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    },
  }),
});

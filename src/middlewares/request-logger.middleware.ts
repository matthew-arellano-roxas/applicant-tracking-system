import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();
  const requestPath = req.originalUrl.split('?')[0];

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${requestPath} ${res.statusCode} ${durationMs}ms`,
    );
  });

  next();
};

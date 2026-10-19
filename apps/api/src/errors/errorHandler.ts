import type { ErrorRequestHandler } from 'express';
import { ApiError } from '@/utils/ApiError';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCodeValue =
    error instanceof ApiError
      ? error.statusCode
      : typeof error === 'object' && error !== null && 'statusCode' in error
        ? error.statusCode
        : typeof error === 'object' && error !== null && 'status' in error
          ? error.status
          : undefined;
  const statusCode = typeof statusCodeValue === 'number' && statusCodeValue >= 400 && statusCodeValue <= 599
    ? statusCodeValue
    : 500;
  const message = error instanceof Error ? error.message : 'Request failed';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : message,
  });
};

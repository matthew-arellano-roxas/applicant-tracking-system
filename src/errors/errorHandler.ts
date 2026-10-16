import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? error.status
      : typeof error === 'object' && error !== null && 'statusCode' in error
        ? error.statusCode
        : undefined;
  const statusCode = typeof status === 'number' && status >= 400 && status <= 599 ? status : 500;

  res.status(statusCode).json({
    error:
      statusCode >= 500
        ? 'Internal Server Error'
        : error instanceof Error
          ? error.message
          : 'Request failed',
  });
};

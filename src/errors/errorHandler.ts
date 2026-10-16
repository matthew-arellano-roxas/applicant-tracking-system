import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCodeValue =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? error.statusCode
      : typeof error === 'object' && error !== null && 'status' in error
        ? error.status
        : undefined;
  const statusCode =
    typeof statusCodeValue === 'number' && statusCodeValue >= 400 && statusCodeValue <= 599
      ? statusCodeValue
      : 500;

  res.status(statusCode).json({
    error:
      statusCode >= 500
        ? 'Internal Server Error'
        : error instanceof Error
          ? error.message
          : 'Request failed',
  });
};

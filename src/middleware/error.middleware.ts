import type { NextFunction, Request, Response } from 'express';
import logger from '@/config/logger';
import { AppError } from '@/utils/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(`Operational error (${err.statusCode}): ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

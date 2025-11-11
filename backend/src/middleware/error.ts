/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextFunction, Request, Response } from 'express';

interface HttpError extends Error {
  status?: number;
  details?: unknown;
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const response = {
    message: err.message ?? 'Internal server error',
    details: err.details,
  };
  if (process.env.NODE_ENV !== 'production') {
    (response as Record<string, unknown>).stack = err.stack;
  }
  res.status(status).json(response);
};


import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const apiRateLimiter = (minutes: number, max: number) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
      });
    },
  });
};
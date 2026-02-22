import { Request, Response, NextFunction } from 'express';
import { consoleIt } from '../utils/consoleIt';
import { HttpError } from '../utils/httpError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    consoleIt.error(err);

    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new HttpError(message, 404);
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new HttpError(message, 400);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
        error = new HttpError(message, 400);
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again!';
        error = new HttpError(message, 401);
    }

    // JWT Expired Error
    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired! Please log in again.';
        error = new HttpError(message, 401);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

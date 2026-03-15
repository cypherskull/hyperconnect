import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        res.status(400).json({ error: 'Database operation failed' });
        return;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
        return;
    }

    // Default error
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { message: err.message, stack: err.stack }),
    });
};

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface HttpError extends Error {
    statusCode?: number;
}

const errorHandlerMiddleware = function errorHandler(
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal server error',
    });
};

export default errorHandlerMiddleware;

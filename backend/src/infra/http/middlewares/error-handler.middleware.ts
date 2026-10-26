import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
const { AppError } = require('../../../shared/errors');

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    
    // 4xx AppErrors are expected outcomes (validation, auth, not found), not defects.
    const isExpectedError = err instanceof AppError && err.statusCode < 500;

    if (!isExpectedError) {
        Sentry.captureException(err);
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    req.log.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}

export = errorHandler;

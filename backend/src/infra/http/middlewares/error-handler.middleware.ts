import { Request, Response, NextFunction } from 'express';
const { AppError } = require('../../../shared/errors');

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    req.log.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}

export = errorHandler;

import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodIssue } from 'zod';

const { ValidationError } = require('../../../shared/errors');

function validate(schema: ZodTypeAny) {
    return function (req: Request, res: Response, next: NextFunction) {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues
                .map((issue: ZodIssue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
                .join('; ');

            return next(new ValidationError(message));
        }

        req.body = result.data;
        next();
    };
}

module.exports = validate;

export {};

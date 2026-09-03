import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../shared/errors';

const BEARER_PREFIX = 'Bearer ';

function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
        return next(new UnauthorizedError('Authentication required'));
    }

    const token = authHeader.slice(BEARER_PREFIX.length);
    const tokenService = req.container.resolve('tokenService');

    try {
        const claims = tokenService.verifyAccessToken(token);
        req.user = { id: Number(claims.sub) };
        return next();
    } catch (err) {
        return next(new UnauthorizedError('Invalid or expired access token'));
    }
}

module.exports = authenticate;

export {};
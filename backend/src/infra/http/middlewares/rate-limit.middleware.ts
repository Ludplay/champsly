import { Request, Response } from 'express';
const rateLimit = require('express-rate-limit');

const WRITE_METHODS = ['POST', 'PUT', 'DELETE'];

const handler = (req: Request, res: Response) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
};

export const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler
});

export const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    skip: (req: Request) => !WRITE_METHODS.includes(req.method)
});

// Tighter than the global limiter — blunts credential stuffing (login) and
// verification-token brute-forcing (verify-email), scoped to /auth/* only.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler
});

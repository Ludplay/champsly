const rateLimit = require('express-rate-limit');

const WRITE_METHODS = ['POST', 'PUT', 'DELETE'];

const handler = (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
};

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler
});

const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    skip: (req) => !WRITE_METHODS.includes(req.method)
});

module.exports = { globalLimiter, writeLimiter };

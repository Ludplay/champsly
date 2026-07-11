const { AppError } = require('../../../shared/errors');

module.exports = function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    req.log.error(err);
    return res.status(500).json({ error: 'Internal server error' });
};

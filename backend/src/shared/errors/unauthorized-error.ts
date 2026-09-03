import AppError = require('./app-error');

class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}

export = UnauthorizedError;

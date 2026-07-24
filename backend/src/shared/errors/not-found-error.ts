import AppError = require('./app-error');

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export = NotFoundError;

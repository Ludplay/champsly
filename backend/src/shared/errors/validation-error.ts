import AppError = require('./app-error');

class ValidationError extends AppError {
    constructor(message = 'Invalid request data') {
        super(message, 400);
    }
}

export = ValidationError;

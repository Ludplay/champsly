import AppError = require('./app-error');

class ConflictError extends AppError {
    constructor(message = 'Conflicting request') {
        super(message, 409);
    }
}

export = ConflictError;

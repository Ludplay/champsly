import AppError = require('./app-error');

class ForbiddenError extends AppError {
    constructor(message = 'You do not have access to this resource') {
        super(message, 403);
    }
}

export = ForbiddenError;

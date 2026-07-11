const { ValidationError } = require('../../../shared/errors');

function validate(schema) {
    return function (req, res, next) {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
                .join('; ');

            return next(new ValidationError(message));
        }

        req.body = result.data;
        next();
    };
}

module.exports = validate;

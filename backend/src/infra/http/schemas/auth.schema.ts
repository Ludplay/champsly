const { z } = require('zod');

// Password schema: Applied at registration only
const newPasswordSchema = z.string()
    .min(8, 'password must be at least 8 characters')
    .regex(/[a-z]/, 'password must contain a lowercase letter')
    .regex(/[A-Z]/, 'password must contain an uppercase letter')
    .regex(/[0-9]/, 'password must contain a digit');

const registrationSchema = z.object({
    name: z.string().trim().min(1, 'name is required'),
    email: z.string().trim().min(1, 'email is required').email('invalid email'),
    password: newPasswordSchema,
});

const verifyEmailSchema = z.object({
    token: z.string().trim().min(1, 'token is required'),
});

const loginSchema = z.object({
    email: z.string().trim().min(1, 'email is required').email('invalid email'),
    password: z.string().min(1, 'password is required'),
});

const resendVerificationSchema = z.object({
    email: z.string().trim().min(1, 'email is required').email('invalid email'),
});

module.exports = {
    registrationSchema,
    verifyEmailSchema,
    loginSchema,
    resendVerificationSchema,
};

export {};

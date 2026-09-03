import { Request, Response, NextFunction } from 'express';

const RegistrationController = async (req: Request, res: Response, next: NextFunction) => {
    const registrationInteractor = req.container.resolve('registrationInteractor');

    const body = req.body;

    const result = await registrationInteractor.execute(body);

    // Secure only outside dev: the frontend dev server (CLAUDE.md) runs over plain
    // http://127.0.0.1:5173, and a Secure cookie is never sent back by the browser
    // over a non-HTTPS origin — this keeps local dev functional without weakening
    // the cookie in production, where NODE_ENV=production always runs behind HTTPS.
    const isProduction = process.env.NODE_ENV === 'production';
    const refreshTokenMaxAgeMs = result.refreshTokenExpiresAt.getTime() - Date.now();

    res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge: refreshTokenMaxAgeMs
    });

    const responseBody = {
        user: result.user,
        accessToken: result.accessToken,
        accessTokenExpiresAt: result.accessTokenExpiresAt
    };

    return res.status(201).json(responseBody);
};

module.exports = RegistrationController;

export {};

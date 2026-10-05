import { Request, Response, NextFunction } from 'express';

const RefreshController = async (req: Request, res: Response, next: NextFunction) => {
    const refreshInteractor = req.container.resolve('refreshInteractor');

    const result = await refreshInteractor.execute({ refreshToken: req.cookies?.refresh_token });

    // Secure only outside dev — see registration.ctrl.ts for why.
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

    return res.status(200).json(responseBody);
};

module.exports = RefreshController;

export {};

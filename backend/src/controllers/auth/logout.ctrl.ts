import { Request, Response, NextFunction } from 'express';

const LogoutController = async (req: Request, res: Response, next: NextFunction) => {
    const logoutInteractor = req.container.resolve('logoutInteractor');

    await logoutInteractor.execute({ refreshToken: req.cookies?.refresh_token });

    res.clearCookie('refresh_token', { path: '/api/v1/auth' });

    return res.sendStatus(204);
};

module.exports = LogoutController;

export {};

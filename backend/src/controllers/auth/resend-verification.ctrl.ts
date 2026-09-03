import { Request, Response, NextFunction } from 'express';

const ResendVerificationController = async (req: Request, res: Response, next: NextFunction) => {
    const resendVerificationInteractor = req.container.resolve('resendVerificationInteractor');

    await resendVerificationInteractor.execute(req.body);

    return res.status(200).json({ message: 'If that email is pending verification, a new link has been sent.' });
};

module.exports = ResendVerificationController;

export {};

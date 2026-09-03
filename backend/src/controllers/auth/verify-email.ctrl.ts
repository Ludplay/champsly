import { Request, Response, NextFunction } from 'express';

const VerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
    const verifyEmailInteractor = req.container.resolve('verifyEmailInteractor');

    const body = req.body;

    const result = await verifyEmailInteractor.execute(body);

    return res.status(200).json(result);
};

module.exports = VerifyEmailController;

export {};

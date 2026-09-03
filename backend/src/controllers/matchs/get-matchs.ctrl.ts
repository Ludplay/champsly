import { Request, Response, NextFunction } from 'express';
const GetMatchsController = async (req: Request, res: Response, next: NextFunction) => {
    const getMatchsInteractor = req.container.resolve('getMatchsInteractor');

    const response = await getMatchsInteractor.execute(req.user!.id);

    return res.status(200).json(response);

};

module.exports = GetMatchsController;

export {};

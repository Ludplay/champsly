import { Request, Response, NextFunction } from 'express';
const GetTournamentsController = async (req: Request, res: Response, next: NextFunction) => {
    const getTournamentsInteractor = req.container.resolve('getTournamentsInteractor');

    const response = await getTournamentsInteractor.execute();

    return res.status(200).json(response);

};

module.exports = GetTournamentsController;

export {};

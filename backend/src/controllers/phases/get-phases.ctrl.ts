import { Request, Response, NextFunction } from 'express';
const GetPhasesController = async (req: Request, res: Response, next: NextFunction) => {
    const getPhasesInteractor = req.container.resolve('getPhasesInteractor');

    const response = await getPhasesInteractor.execute();

    return res.status(200).json(response);

};

module.exports = GetPhasesController;

export {};

import { Request, Response, NextFunction } from 'express';
const CreateTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const createTournamentInteractor = req.container.resolve('createTournamentInteractor');

    const body = req.body;
    
    const response = await createTournamentInteractor.execute(body);

    return res.status(200).json(response);

};

module.exports = CreateTournamentController;

export {};

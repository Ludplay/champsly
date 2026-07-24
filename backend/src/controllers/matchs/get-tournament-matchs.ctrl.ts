import { Request, Response, NextFunction } from 'express';
const GetTournamentMatchsController = async (req: Request, res: Response, next: NextFunction) => {
    const getTournamentMatchsInteractor = req.container.resolve('getTournamentMatchsInteractor');

    const { tournamentId } = req.params;
    const response = await getTournamentMatchsInteractor.execute(Number(tournamentId));

    return res.status(200).json(response);

};

module.exports = GetTournamentMatchsController;

export {};

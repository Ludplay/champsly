import { Request, Response, NextFunction } from 'express';
const GetTournamentGroupsController = async (req: Request, res: Response, next: NextFunction) => {
    const getGroupsInteractor = req.container.resolve('getGroupsInteractor');
    const { tournamentId } = req.params;

    const response = await getGroupsInteractor.executeByTournament(Number(tournamentId), req.user!.id);

    return res.status(200).json(response);
};

module.exports = GetTournamentGroupsController;

export {};

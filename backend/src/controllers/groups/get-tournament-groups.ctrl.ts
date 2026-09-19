import { Request, Response, NextFunction } from 'express';
import { GetTournamentGroupsQuery } from '../../application/queries/get-tournament-groups.query';

const GetTournamentGroupsController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');
    const { tournamentId } = req.params;

    const input = { tournamentId: Number(tournamentId), userId: req.user!.id };
    const query = new GetTournamentGroupsQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);
};

module.exports = GetTournamentGroupsController;

export {};

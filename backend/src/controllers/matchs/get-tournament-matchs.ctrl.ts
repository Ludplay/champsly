import { Request, Response, NextFunction } from 'express';
import { GetTournamentMatchesQuery } from '../../application/queries/get-tournament-matches.query';

const GetTournamentMatchsController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const { tournamentId } = req.params;
    const input = { tournamentId: Number(tournamentId), userId: req.user!.id };
    const query = new GetTournamentMatchesQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = GetTournamentMatchsController;

export {};

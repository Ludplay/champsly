import { Request, Response, NextFunction } from 'express';
import { ReadTournamentQuery } from '../../application/queries/read-tournament.query';

const ReadTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');
    const { id } = req.params;

    const input = { id: Number(id), userId: req.user!.id };
    const query = new ReadTournamentQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = ReadTournamentController;

export {};

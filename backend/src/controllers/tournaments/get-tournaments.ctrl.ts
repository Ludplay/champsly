import { Request, Response, NextFunction } from 'express';
import { GetTournamentsQuery } from '../../application/queries/get-tournaments.query';

const GetTournamentsController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const input = { userId: req.user!.id };
    const query = new GetTournamentsQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = GetTournamentsController;

export {};

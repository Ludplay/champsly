import { Request, Response, NextFunction } from 'express';
import { GetMatchsQuery } from '../../application/queries/get-matchs.query';

const GetMatchsController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const input = { userId: req.user!.id };
    const query = new GetMatchsQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = GetMatchsController;

export {};

import { Request, Response, NextFunction } from 'express';
import { GetPlayersQuery } from '../../application/queries/get-players.query';

const GetPlayersController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const query = new GetPlayersQuery();

    const response = await queryBus.execute(query);

    return res.status(200)
        .json(response);

};

module.exports = GetPlayersController;
export {};

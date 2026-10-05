import { Request, Response, NextFunction } from 'express';
import { GetPlayersQuery } from '../../application/queries/get-players.query';
import type { PlayerDTO } from '../../application/dtos/player.dto';

const GetPlayersV2Controller = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const input = { userId: req.user!.id };
    const query = new GetPlayersQuery(input);
    const players = await queryBus.execute<PlayerDTO[]>(query);

    return res.status(200)
        .json({
            data: players,
            meta: { count: players.length }
        });

};

module.exports = GetPlayersV2Controller;

export {};

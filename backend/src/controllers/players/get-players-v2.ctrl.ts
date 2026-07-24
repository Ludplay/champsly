import { Request, Response, NextFunction } from 'express';
const GetPlayersV2Controller = async (req: Request, res: Response, next: NextFunction) => {
    const getPlayersInteractor = req.container.resolve('getPlayersInteractor');

    const players = await getPlayersInteractor.execute();

    return res.status(200)
        .json({
            data: players,
            meta: { count: players.length }
        });

};

module.exports = GetPlayersV2Controller;

export {};

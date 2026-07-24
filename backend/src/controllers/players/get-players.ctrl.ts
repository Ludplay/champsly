import { Request, Response, NextFunction } from 'express';
const GetPlayersController = async (req: Request, res: Response, next: NextFunction) => {
    const getPlayersInteractor = req.container.resolve('getPlayersInteractor');
    
    const response = await getPlayersInteractor.execute();

    return res.status(200)
        .json(response);

};

module.exports = GetPlayersController;
export {};

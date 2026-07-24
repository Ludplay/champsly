import { Request, Response, NextFunction } from 'express';
const CreatePlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const createPlayerInteractor = req.container.resolve('createPlayerInteractor');

    const body = req.body;
    
    const response = await createPlayerInteractor.execute(body);

    return res.status(200)
        .json(response);

};

module.exports = CreatePlayerController;
export {};

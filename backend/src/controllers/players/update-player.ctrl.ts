import { Request, Response, NextFunction } from 'express';
const UpdatePlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const updatePlayerInteractor = req.container.resolve('updatePlayerInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updatePlayerInteractor.execute(Number(id), body);

    return res.status(200).json(response);

};

module.exports = UpdatePlayerController;
export {};

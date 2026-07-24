import { Request, Response, NextFunction } from 'express';
const ReadPlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const readPlayerInteractor = req.container.resolve('readPlayerInteractor');
    const { id } = req.params;

    const response = await readPlayerInteractor.execute(Number(id));

    return res.status(200).json(response);

};

module.exports = ReadPlayerController;
export {};

import { Request, Response, NextFunction } from 'express';
const DeletePlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const deletePlayerInteractor = req.container.resolve('deletePlayerInteractor');
    const { id } = req.params;

    const deleted = await deletePlayerInteractor.execute(Number(id));

    return res.status(200).json({ deleted });

};

module.exports = DeletePlayerController;
export {};

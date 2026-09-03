import { Request, Response, NextFunction } from 'express';
const DeleteMatchController = async (req: Request, res: Response, next: NextFunction) => {
    const deleteMatchInteractor = req.container.resolve('deleteMatchInteractor');
    const { id } = req.params;

    const deleted = await deleteMatchInteractor.execute(Number(id), req.user!.id);

    return res.status(200).json({ deleted });

};

module.exports = DeleteMatchController;

export {};

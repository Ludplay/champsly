import { Request, Response, NextFunction } from 'express';
const DeleteGroupController = async (req: Request, res: Response, next: NextFunction) => {
    const deleteGroupInteractor = req.container.resolve('deleteGroupInteractor');
    const { id } = req.params;

    const deleted = await deleteGroupInteractor.execute(Number(id));

    return res.status(200).json({ deleted });

};

module.exports = DeleteGroupController;

export {};

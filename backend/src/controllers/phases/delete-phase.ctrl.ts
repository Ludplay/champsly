import { Request, Response, NextFunction } from 'express';
const DeletePhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const deletePhaseInteractor = req.container.resolve('deletePhaseInteractor');
    const { id } = req.params;

    const deleted = await deletePhaseInteractor.execute(Number(id));

    return res.status(200).json({ deleted });

};

module.exports = DeletePhaseController;

export {};

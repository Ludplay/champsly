import { Request, Response, NextFunction } from 'express';
const UpdatePhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const updatePhaseInteractor = req.container.resolve('updatePhaseInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updatePhaseInteractor.execute(Number(id), body, req.user!.id);

    return res.status(200).json(response);

};

module.exports = UpdatePhaseController;

export {};

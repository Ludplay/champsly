import { Request, Response, NextFunction } from 'express';
const CreatePhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const createPhaseInteractor = req.container.resolve('createPhaseInteractor');

    const body = req.body;
    
    const response = await createPhaseInteractor.execute(body, req.user!.id);

    return res.status(200).json(response);

};

module.exports = CreatePhaseController;

export {};

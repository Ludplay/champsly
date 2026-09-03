import { Request, Response, NextFunction } from 'express';
const ReadPhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const readPhaseInteractor = req.container.resolve('readPhaseInteractor');
    const { id } = req.params;

    const response = await readPhaseInteractor.execute(Number(id), req.user!.id);

    return res.status(200).json(response);

};

module.exports = ReadPhaseController;

export {};

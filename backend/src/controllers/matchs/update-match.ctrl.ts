import { Request, Response, NextFunction } from 'express';
const UpdateMatchController = async (req: Request, res: Response, next: NextFunction) => {
    const updateMatchInteractor = req.container.resolve('updateMatchInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updateMatchInteractor.execute(Number(id), body);

    return res.status(200).json(response);

};

module.exports = UpdateMatchController;

export {};

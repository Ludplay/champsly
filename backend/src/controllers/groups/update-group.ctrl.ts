import { Request, Response, NextFunction } from 'express';
const UpdateGroupController = async (req: Request, res: Response, next: NextFunction) => {
    const updateGroupInteractor = req.container.resolve('updateGroupInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updateGroupInteractor.execute(Number(id), body);

    return res.status(200).json(response);

};

module.exports = UpdateGroupController;

export {};

import { Request, Response, NextFunction } from 'express';
const CreateGroupController = async (req: Request, res: Response, next: NextFunction) => {
    const createGroupInteractor = req.container.resolve('createGroupInteractor');

    const body = req.body;
    
    const response = await createGroupInteractor.execute(body, req.user!.id);

    return res.status(200).json(response);

};

module.exports = CreateGroupController;

export {};

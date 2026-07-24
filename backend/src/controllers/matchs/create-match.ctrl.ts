import { Request, Response, NextFunction } from 'express';
const CreateMatchController = async (req: Request, res: Response, next: NextFunction) => {
    const createMatchInteractor = req.container.resolve('createMatchInteractor');

    const body = req.body;
    
    const response = await createMatchInteractor.execute(body);

    return res.status(200).json(response);

};

module.exports = CreateMatchController;

export {};

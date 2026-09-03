import { Request, Response, NextFunction } from 'express';
const GetGroupsController = async (req: Request, res: Response, next: NextFunction) => {
    const getGroupsInteractor = req.container.resolve('getGroupsInteractor');

    const response = await getGroupsInteractor.execute(req.user!.id);

    return res.status(200).json(response);

};

module.exports = GetGroupsController;

export {};

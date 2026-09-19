import { Request, Response, NextFunction } from 'express';
import { GetGroupsQuery } from '../../application/queries/get-groups.query';

const GetGroupsController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const input = { userId: req.user!.id };
    const query = new GetGroupsQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = GetGroupsController;

export {};

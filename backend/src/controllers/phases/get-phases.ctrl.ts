import { Request, Response, NextFunction } from 'express';
import { GetPhasesQuery } from '../../application/queries/get-phases.query';

const GetPhasesController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');

    const input = { userId: req.user!.id };
    const query = new GetPhasesQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = GetPhasesController;

export {};

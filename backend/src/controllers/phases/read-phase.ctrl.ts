import { Request, Response, NextFunction } from 'express';
import { ReadPhaseQuery } from '../../application/queries/read-phase.query';

const ReadPhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const queryBus = req.container.resolve('queryBus');
    const { id } = req.params;

    const input = { id: Number(id), userId: req.user!.id };
    const query = new ReadPhaseQuery(input);

    const response = await queryBus.execute(query);

    return res.status(200).json(response);

};

module.exports = ReadPhaseController;

export {};

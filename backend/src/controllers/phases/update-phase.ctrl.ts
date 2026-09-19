import { Request, Response, NextFunction } from 'express';
import { UpdatePhaseCommand } from '../../application/commands/update-phase.command';

const UpdatePhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');
    const { id } = req.params;

    const input = { id: Number(id), changes: req.body, userId: req.user!.id };
    const command = new UpdatePhaseCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = UpdatePhaseController;

export {};

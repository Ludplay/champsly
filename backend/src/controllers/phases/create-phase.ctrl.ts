import { Request, Response, NextFunction } from 'express';
import { CreatePhaseCommand } from '../../application/commands/create-phase.command';

const CreatePhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');

    const input = { ...req.body, userId: req.user!.id };
    const command = new CreatePhaseCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = CreatePhaseController;

export {};

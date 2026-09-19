import { Request, Response, NextFunction } from 'express';
import { CreateMatchCommand } from '../../application/commands/create-match.command';

const CreateMatchController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');

    const input = { ...req.body, userId: req.user!.id };
    const command = new CreateMatchCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = CreateMatchController;

export {};

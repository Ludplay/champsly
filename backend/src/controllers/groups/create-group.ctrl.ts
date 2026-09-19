import { Request, Response, NextFunction } from 'express';
import { CreateGroupCommand } from '../../application/commands/create-group.command';

const CreateGroupController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');

    const input = { ...req.body, userId: req.user!.id };
    const command = new CreateGroupCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = CreateGroupController;

export {};

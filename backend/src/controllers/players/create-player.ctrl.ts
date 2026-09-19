import { Request, Response, NextFunction } from 'express';
import { CreatePlayerCommand } from '../../application/commands/create-player.command';

const CreatePlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');

    const input = req.body;
    const command = new CreatePlayerCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200)
        .json(response);

};

module.exports = CreatePlayerController;
export {};

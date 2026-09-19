import { Request, Response, NextFunction } from 'express';
import { UpdatePlayerCommand } from '../../application/commands/update-player.command';

const UpdatePlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');
    const { id } = req.params;

    const input = { id: Number(id), changes: req.body };
    const command = new UpdatePlayerCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = UpdatePlayerController;
export {};

import { Request, Response, NextFunction } from 'express';
import { DeletePlayerCommand } from '../../application/commands/delete-player.command';

const DeletePlayerController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');
    const { id } = req.params;

    const input = { id: Number(id), userId: req.user!.id };
    const command = new DeletePlayerCommand(input);

    const deleted = await commandBus.execute(command);

    return res.status(200).json({ deleted });

};

module.exports = DeletePlayerController;
export {};

import { Request, Response, NextFunction } from 'express';
import { UpdateGroupCommand } from '../../application/commands/update-group.command';

const UpdateGroupController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');
    const { id } = req.params;

    const input = { id: Number(id), changes: req.body, userId: req.user!.id };
    const command = new UpdateGroupCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = UpdateGroupController;

export {};

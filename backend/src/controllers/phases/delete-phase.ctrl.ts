import { Request, Response, NextFunction } from 'express';
import { DeletePhaseCommand } from '../../application/commands/delete-phase.command';

const DeletePhaseController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');
    const { id } = req.params;

    const input = { id: Number(id), userId: req.user!.id };
    const command = new DeletePhaseCommand(input);

    const deleted = await commandBus.execute(command);

    return res.status(200).json({ deleted });

};

module.exports = DeletePhaseController;

export {};

import { Request, Response, NextFunction } from 'express';
import { UpdateTournamentCommand } from '../../application/commands/update-tournament.command';

const UpdateTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');
    const { id } = req.params;

    const input = { id: Number(id), changes: req.body, userId: req.user!.id };
    const command = new UpdateTournamentCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = UpdateTournamentController;

export {};

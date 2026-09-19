import { Request, Response, NextFunction } from 'express';
import { CreateTournamentCommand } from '../../application/commands/create-tournament.command';

const CreateTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');

    const input = { ...req.body, userId: req.user!.id };
    const command = new CreateTournamentCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200).json(response);

};

module.exports = CreateTournamentController;

export {};

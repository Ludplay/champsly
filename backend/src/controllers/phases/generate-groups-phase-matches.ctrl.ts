import { Request, Response, NextFunction } from 'express';
import { GenerateGroupsPhaseMatchesCommand } from '../../application/commands/generate-groups-phase-matches.command';

const GenerateGroupsPhaseMatchesController = async (req: Request, res: Response, next: NextFunction) => {
    const commandBus = req.container.resolve('commandBus');

    if (!(req.body?.id > 0)) {
        return res.status(403)
            .json('tournament id not sent');
    }

    const input = { tournamentId: req.body.id, userId: req.user!.id };
    const command = new GenerateGroupsPhaseMatchesCommand(input);

    const response = await commandBus.execute(command);

    return res.status(200)
        .json(response);

};

module.exports = GenerateGroupsPhaseMatchesController;
export {};

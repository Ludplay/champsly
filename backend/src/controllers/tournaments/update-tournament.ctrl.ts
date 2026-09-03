import { Request, Response, NextFunction } from 'express';
const UpdateTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const updateTournamentInteractor = req.container.resolve('updateTournamentInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updateTournamentInteractor.execute(Number(id), body, req.user!.id);

    return res.status(200).json(response);

};

module.exports = UpdateTournamentController;

export {};

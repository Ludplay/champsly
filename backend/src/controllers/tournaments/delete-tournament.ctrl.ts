import { Request, Response, NextFunction } from 'express';
const DeleteTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const deleteTournamentInteractor = req.container.resolve('deleteTournamentInteractor');
    const { id } = req.params;

    const deleted = await deleteTournamentInteractor.execute(Number(id));

    return res.status(200).json({ deleted });

};

module.exports = DeleteTournamentController;

export {};

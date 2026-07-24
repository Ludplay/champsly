import { Request, Response, NextFunction } from 'express';
const ReadTournamentController = async (req: Request, res: Response, next: NextFunction) => {
    const readTournamentInteractor = req.container.resolve('readTournamentInteractor');
    const { id } = req.params;

    const response = await readTournamentInteractor.execute(Number(id));

    return res.status(200).json(response);

};

module.exports = ReadTournamentController;

export {};

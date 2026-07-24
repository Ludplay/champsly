import { Request, Response, NextFunction } from 'express';
const ReadMatchController = async (req: Request, res: Response, next: NextFunction) => {
    const readMatchInteractor = req.container.resolve('readMatchInteractor');
    const { id } = req.params;

    const response = await readMatchInteractor.execute(Number(id));

    return res.status(200).json(response);

};

module.exports = ReadMatchController;

export {};

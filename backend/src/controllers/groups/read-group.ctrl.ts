import { Request, Response, NextFunction } from 'express';
const ReadGroupController = async (req: Request, res: Response, next: NextFunction) => {
    const readGroupInteractor = req.container.resolve('readGroupInteractor');
    const { id } = req.params;

    const response = await readGroupInteractor.execute(Number(id));

    return res.status(200).json(response);

};

module.exports = ReadGroupController;

export {};

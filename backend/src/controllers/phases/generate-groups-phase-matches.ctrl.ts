import { Request, Response, NextFunction } from 'express';
const GenerateGroupsPhaseMatchesController = async (req: Request, res: Response, next: NextFunction) => {
    const interactor = req.container.resolve('generateGroupsPhaseMatchesInteractor');
    const body = req.body;

    if (!(req.body?.id > 0)) {
        return res.status(403)
            .json('tournament id not sent');
    }

    const response = await interactor.execute(req.body.id);

    //if ()

    return res.status(200)
        .json(response);

};

module.exports = GenerateGroupsPhaseMatchesController;
export {};

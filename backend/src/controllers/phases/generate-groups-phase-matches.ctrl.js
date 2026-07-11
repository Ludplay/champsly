const GenerateGroupsPhaseMatchesController = async (req, res, next) => {
    const interactor = req.container.resolve('generateGroupsPhaseMatchesInteractor');
    const body = req.body;

    if (!req.body?.id > 0) {
        return res.status(403)
            .json('tournament id not sent');
    }

    const response = await interactor.execute(req.body.id);

    //if ()

    return res.status(200)
        .json(response);

};

module.exports = GenerateGroupsPhaseMatchesController;
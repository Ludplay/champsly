const GetPhasesController = async (req, res, next) => {
    const getPhasesInteractor = req.container.resolve('getPhasesInteractor');

    const response = await getPhasesInteractor.execute();

    return res.status(200).json(response);

};

module.exports = GetPhasesController;

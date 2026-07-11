const ReadPhaseController = async (req, res, next) => {
    const readPhaseInteractor = req.container.resolve('readPhaseInteractor');
    const { id } = req.params;

    const response = await readPhaseInteractor.execute(id);

    return res.status(200).json(response);

};

module.exports = ReadPhaseController;

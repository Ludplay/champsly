const UpdatePhaseController = async (req, res, next) => {
    const updatePhaseInteractor = req.container.resolve('updatePhaseInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updatePhaseInteractor.execute(id, body);

    return res.status(200).json(response);

};

module.exports = UpdatePhaseController;

const CreatePhaseController = async (req, res, next) => {
    const createPhaseInteractor = req.container.resolve('createPhaseInteractor');

    const body = req.body;
    
    const response = await createPhaseInteractor.execute(body);

    return res.status(200).json(response);

};

module.exports = CreatePhaseController;

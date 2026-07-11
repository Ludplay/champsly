const CreateMatchController = async (req, res, next) => {
    const createMatchInteractor = req.container.resolve('createMatchInteractor');

    const body = req.body;
    
    const response = await createMatchInteractor.execute(body);

    return res.status(200).json(response);

};

module.exports = CreateMatchController;

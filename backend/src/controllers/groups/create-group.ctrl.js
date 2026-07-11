const CreateGroupController = async (req, res, next) => {
    const createGroupInteractor = req.container.resolve('createGroupInteractor');

    const body = req.body;
    
    const response = await createGroupInteractor.execute(body);

    return res.status(200).json(response);

};

module.exports = CreateGroupController;

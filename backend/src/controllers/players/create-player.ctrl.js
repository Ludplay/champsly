const CreatePlayerController = async (req, res, next) => {
    const createPlayerInteractor = req.container.resolve('createPlayerInteractor');

    const body = req.body;
    
    const response = await createPlayerInteractor.execute(body);

    return res.status(200)
        .json(response);

};

module.exports = CreatePlayerController;
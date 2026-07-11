const GetPlayersController = async (req, res, next) => {
    const getPlayersInteractor = req.container.resolve('getPlayersInteractor');
    
    const response = await getPlayersInteractor.execute();

    return res.status(200)
        .json(response);

};

module.exports = GetPlayersController;
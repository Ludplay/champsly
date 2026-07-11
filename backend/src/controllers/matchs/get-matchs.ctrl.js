const GetMatchsController = async (req, res, next) => {
    const getMatchsInteractor = req.container.resolve('getMatchsInteractor');

    const response = await getMatchsInteractor.execute();

    return res.status(200).json(response);

};

module.exports = GetMatchsController;

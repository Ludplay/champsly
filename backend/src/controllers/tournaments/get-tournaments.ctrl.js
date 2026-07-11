const GetTournamentsController = async (req, res, next) => {
    const getTournamentsInteractor = req.container.resolve('getTournamentsInteractor');

    const response = await getTournamentsInteractor.execute();

    return res.status(200).json(response);

};

module.exports = GetTournamentsController;

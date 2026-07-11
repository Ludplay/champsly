const CreateTournamentController = async (req, res, next) => {
    const createTournamentInteractor = req.container.resolve('createTournamentInteractor');

    const body = req.body;
    
    const response = await createTournamentInteractor.execute(body);

    return res.status(200).json(response);

};

module.exports = CreateTournamentController;

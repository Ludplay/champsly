const UpdateTournamentController = async (req, res, next) => {
    const updateTournamentInteractor = req.container.resolve('updateTournamentInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updateTournamentInteractor.execute(id, body);

    return res.status(200).json(response);

};

module.exports = UpdateTournamentController;

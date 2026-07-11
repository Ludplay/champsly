const GetTournamentMatchsController = async (req, res, next) => {
    const getTournamentMatchsInteractor = req.container.resolve('getTournamentMatchsInteractor');

    const { tournamentId } = req.params;
    const response = await getTournamentMatchsInteractor.execute(tournamentId);

    return res.status(200).json(response);

};

module.exports = GetTournamentMatchsController;

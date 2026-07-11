const GetTournamentGroupsController = async (req, res, next) => {
    const getGroupsInteractor = req.container.resolve('getGroupsInteractor');
    const { tournamentId } = req.params;

    const response = await getGroupsInteractor.executeByTournament(tournamentId);

    return res.status(200).json(response);
};

module.exports = GetTournamentGroupsController;

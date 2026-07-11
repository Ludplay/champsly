const DeleteTournamentController = async (req, res, next) => {
    const deleteTournamentInteractor = req.container.resolve('deleteTournamentInteractor');
    const { id } = req.params;

    const deleted = await deleteTournamentInteractor.execute(id);

    return res.status(200).json({ deleted });

};

module.exports = DeleteTournamentController;

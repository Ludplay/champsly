const ReadTournamentController = async (req, res, next) => {
    const readTournamentInteractor = req.container.resolve('readTournamentInteractor');
    const { id } = req.params;

    const response = await readTournamentInteractor.execute(id);

    return res.status(200).json(response);

};

module.exports = ReadTournamentController;

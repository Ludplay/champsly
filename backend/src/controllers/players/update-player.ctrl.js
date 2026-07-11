const UpdatePlayerController = async (req, res, next) => {
    const updatePlayerInteractor = req.container.resolve('updatePlayerInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updatePlayerInteractor.execute(id, body);

    return res.status(200).json(response);

};

module.exports = UpdatePlayerController;
const ReadPlayerController = async (req, res, next) => {
    const readPlayerInteractor = req.container.resolve('readPlayerInteractor');
    const { id } = req.params;

    const response = await readPlayerInteractor.execute(id);

    return res.status(200).json(response);

};

module.exports = ReadPlayerController;
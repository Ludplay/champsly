const DeletePlayerController = async (req, res, next) => {
    const deletePlayerInteractor = req.container.resolve('deletePlayerInteractor');
    const { id } = req.params;

    const deleted = await deletePlayerInteractor.execute(id);

    return res.status(200).json({ deleted });

};

module.exports = DeletePlayerController;
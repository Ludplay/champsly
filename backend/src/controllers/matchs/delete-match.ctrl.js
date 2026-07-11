const DeleteMatchController = async (req, res, next) => {
    const deleteMatchInteractor = req.container.resolve('deleteMatchInteractor');
    const { id } = req.params;

    const deleted = await deleteMatchInteractor.execute(id);

    return res.status(200).json({ deleted });

};

module.exports = DeleteMatchController;

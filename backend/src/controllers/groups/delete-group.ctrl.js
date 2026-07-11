const DeleteGroupController = async (req, res, next) => {
    const deleteGroupInteractor = req.container.resolve('deleteGroupInteractor');
    const { id } = req.params;

    const deleted = await deleteGroupInteractor.execute(id);

    return res.status(200).json({ deleted });

};

module.exports = DeleteGroupController;

const DeletePhaseController = async (req, res, next) => {
    const deletePhaseInteractor = req.container.resolve('deletePhaseInteractor');
    const { id } = req.params;

    const deleted = await deletePhaseInteractor.execute(id);

    return res.status(200).json({ deleted });

};

module.exports = DeletePhaseController;

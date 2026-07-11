const UpdateGroupController = async (req, res, next) => {
    const updateGroupInteractor = req.container.resolve('updateGroupInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updateGroupInteractor.execute(id, body);

    return res.status(200).json(response);

};

module.exports = UpdateGroupController;

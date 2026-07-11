const UpdateMatchController = async (req, res, next) => {
    const updateMatchInteractor = req.container.resolve('updateMatchInteractor');
    const { id } = req.params;
    const body = req.body;

    const response = await updateMatchInteractor.execute(id, body);

    return res.status(200).json(response);

};

module.exports = UpdateMatchController;

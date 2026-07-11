const ReadGroupController = async (req, res, next) => {
    const readGroupInteractor = req.container.resolve('readGroupInteractor');
    const { id } = req.params;

    const response = await readGroupInteractor.execute(id);

    return res.status(200).json(response);

};

module.exports = ReadGroupController;

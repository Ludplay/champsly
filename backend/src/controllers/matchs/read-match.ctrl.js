const ReadMatchController = async (req, res, next) => {
    const readMatchInteractor = req.container.resolve('readMatchInteractor');
    const { id } = req.params;

    const response = await readMatchInteractor.execute(id);

    return res.status(200).json(response);

};

module.exports = ReadMatchController;

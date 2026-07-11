const GetGroupsController = async (req, res, next) => {
    const getGroupsInteractor = req.container.resolve('getGroupsInteractor');

    const response = await getGroupsInteractor.execute();

    return res.status(200).json(response);

};

module.exports = GetGroupsController;

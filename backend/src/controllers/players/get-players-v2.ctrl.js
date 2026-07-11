const GetPlayersV2Controller = async (req, res, next) => {
    const getPlayersInteractor = req.container.resolve('getPlayersInteractor');

    const players = await getPlayersInteractor.execute();

    return res.status(200)
        .json({
            data: players,
            meta: { count: players.length }
        });

};

module.exports = GetPlayersV2Controller;

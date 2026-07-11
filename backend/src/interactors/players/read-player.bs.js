
class ReadPlayerInteractor {

    constructor(params) {
        this.playerRepository = params.playerRepository;
    }

    async execute(id) {
        return await this.playerRepository.getOne(id);
    }

}

module.exports = ReadPlayerInteractor;
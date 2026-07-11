
class DeletePlayerInteractor {

    constructor(params) {
        this.playerRepository = params.playerRepository;
    }

    async execute(id) {
        return await this.playerRepository.delete(id);
    }

}

module.exports = DeletePlayerInteractor;
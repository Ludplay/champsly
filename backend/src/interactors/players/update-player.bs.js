
class UpdatePlayerInteractor {

    constructor(params) {
        this.playerRepository = params.playerRepository;
    }

    async execute(id, input) {
        return await this.playerRepository.update(id, input);
    }

}

module.exports = UpdatePlayerInteractor;
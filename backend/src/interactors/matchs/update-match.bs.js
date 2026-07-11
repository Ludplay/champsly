
class UpdateMatchInteractor {

    constructor(params) {
        this.matchRepository = params.matchRepository;
    }

    async execute(id, input) {
        return await this.matchRepository.update(id, input);
    }

}

module.exports = UpdateMatchInteractor;

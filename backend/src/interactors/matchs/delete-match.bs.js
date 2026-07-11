
class DeleteMatchInteractor {

    constructor(params) {
        this.matchRepository = params.matchRepository;
    }

    async execute(id) {
        return await this.matchRepository.delete(id);
    }

}

module.exports = DeleteMatchInteractor;

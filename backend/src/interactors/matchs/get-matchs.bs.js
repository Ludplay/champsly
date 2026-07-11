
class GetMatchsInteractor {

    constructor(params) {
        this.matchRepository = params.matchRepository;
    }

    async execute() {
        return await this.matchRepository.getAll();
    }

}

module.exports = GetMatchsInteractor;

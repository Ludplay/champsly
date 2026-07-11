
class ReadMatchInteractor {

    constructor(params) {
        this.matchRepository = params.matchRepository;
    }

    async execute(id) {
        return await this.matchRepository.getOne(id);
    }

}

module.exports = ReadMatchInteractor;

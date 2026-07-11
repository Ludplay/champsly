
class ReadPhaseInteractor {

    constructor(params) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(id) {
        return await this.phaseRepository.getOne(id);
    }

}

module.exports = ReadPhaseInteractor;

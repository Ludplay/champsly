
class UpdatePhaseInteractor {

    constructor(params) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(id, input) {
        return await this.phaseRepository.update(id, input);
    }

}

module.exports = UpdatePhaseInteractor;

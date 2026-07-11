
class DeletePhaseInteractor {

    constructor(params) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(id) {
        return await this.phaseRepository.delete(id);
    }

}

module.exports = DeletePhaseInteractor;


class GetPhasesInteractor {

    constructor(params) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute() {

        const phases = await this.phaseRepository.getAll();

        const mappedPhases = phases.map(record => {
            const phase = record.toJSON();

            return {
                ...phase,
                tournament: phase.Tournaments.name
            }
        });

        return mappedPhases;
    }

}

module.exports = GetPhasesInteractor;

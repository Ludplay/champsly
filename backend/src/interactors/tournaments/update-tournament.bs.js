
class UpdateTournamentInteractor {

    constructor(params) {
        this.tournamentRepository = params.tournamentRepository;
    }

    async execute(id, input) {
        return await this.tournamentRepository.update(id, input);
    }

}

module.exports = UpdateTournamentInteractor;

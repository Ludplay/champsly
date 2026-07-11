
class DeleteTournamentInteractor {

    constructor(params) {
        this.tournamentRepository = params.tournamentRepository;
    }

    async execute(id) {
        return await this.tournamentRepository.delete(id);
    }

}

module.exports = DeleteTournamentInteractor;

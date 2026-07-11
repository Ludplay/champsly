
class ReadTournamentInteractor {

    constructor(params) {
        this.tournamentRepository = params.tournamentRepository;
    }

    async execute(id) {
        return await this.tournamentRepository.getOne(id);
    }

}

module.exports = ReadTournamentInteractor;

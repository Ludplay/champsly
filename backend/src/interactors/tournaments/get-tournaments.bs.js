
class GetTournamentsInteractor {

    constructor(params) {
        this.tournamentRepository = params.tournamentRepository;
        this.logger = params.logger;
    }

    async execute() {

        const tournaments = await this.tournamentRepository.getAll();

        this.logger.debug({ tournaments }, 'Fetched tournaments');

        return tournaments;
    }

}

module.exports = GetTournamentsInteractor;

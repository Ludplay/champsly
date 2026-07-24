import type { TournamentRepository } from '../../shared/repositories/tournament.types';

class ReadTournamentInteractor {
    private tournamentRepository: TournamentRepository;

    constructor(params: { tournamentRepository: TournamentRepository }) {
        this.tournamentRepository = params.tournamentRepository;
    }

    async execute(id: number) {
        return await this.tournamentRepository.getOne(id);
    }

}

export = ReadTournamentInteractor;

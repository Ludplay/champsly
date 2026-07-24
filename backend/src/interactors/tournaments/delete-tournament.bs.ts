import type { TournamentRepository } from '../../shared/repositories/tournament.types';

class DeleteTournamentInteractor {
    private tournamentRepository: TournamentRepository;

    constructor(params: { tournamentRepository: TournamentRepository }) {
        this.tournamentRepository = params.tournamentRepository;
    }

    async execute(id: number) {
        return await this.tournamentRepository.delete(id);
    }

}

export = DeleteTournamentInteractor;

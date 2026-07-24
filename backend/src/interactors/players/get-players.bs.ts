import type { PlayerRepository } from '../../shared/repositories/player.types';

class GetPlayersInteractor {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute() {
        const all = await this.playerRepository.getAll();
        return all;
    }

}

export = GetPlayersInteractor;

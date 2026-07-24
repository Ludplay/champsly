import type { PlayerRepository } from '../../shared/repositories/player.types';

class DeletePlayerInteractor {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(id: number) {
        return await this.playerRepository.delete(id);
    }

}

export = DeletePlayerInteractor;

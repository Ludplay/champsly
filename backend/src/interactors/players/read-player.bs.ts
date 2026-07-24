import type { PlayerRepository } from '../../shared/repositories/player.types';

class ReadPlayerInteractor {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(id: number) {
        return await this.playerRepository.getOne(id);
    }

}

export = ReadPlayerInteractor;

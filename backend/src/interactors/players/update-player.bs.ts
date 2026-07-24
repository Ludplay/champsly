import { CreationAttributes } from 'sequelize';
import type { PlayerRepository } from '../../shared/repositories/player.types';
import { Player } from '../../infra/db/models/player';

class UpdatePlayerInteractor {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(id: number, input: Partial<CreationAttributes<Player>>) {
        return await this.playerRepository.update(id, input);
    }

}

export = UpdatePlayerInteractor;

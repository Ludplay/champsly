import { CreationAttributes } from 'sequelize';
import type { PlayerRepository } from '../../shared/repositories/player.types';
import { Player } from '../../infra/db/models/player';

class CreatePlayerInteractor {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(input: Pick<CreationAttributes<Player>, 'name'>) {

        const { name } = input;

        const inputRecord = {
            name
        };

        const response = await this.playerRepository.create(inputRecord);

        return response;
    }

}

export = CreatePlayerInteractor;

import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type { PlayerDTO } from '../../dtos/player.dto';
import type { GetPlayersQuery } from '../get-players.query';

class GetPlayersQueryHandler {
    private playerRepository: PlayerRepository;

    constructor(params: { playerReadRepository: PlayerRepository }) {
        this.playerRepository = params.playerReadRepository;
    }

    async execute(query: GetPlayersQuery): Promise<PlayerDTO[]> {
        const players = await this.playerRepository.getAll();
        return players.map((player) => player.toJSON<PlayerDTO>());
    }

}

export = GetPlayersQueryHandler;

import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type { PlayerDTO } from '../../dtos/player.dto';
import type { ReadPlayerQuery } from '../read-player.query';

class ReadPlayerQueryHandler {
    private playerRepository: PlayerRepository;

    constructor(params: { playerReadRepository: PlayerRepository }) {
        this.playerRepository = params.playerReadRepository;
    }

    async execute(query: ReadPlayerQuery): Promise<PlayerDTO | null> {
        const player = await this.playerRepository.getOne(query.id);
        return player ? player.toJSON<PlayerDTO>() : null;
    }

}

export = ReadPlayerQueryHandler;

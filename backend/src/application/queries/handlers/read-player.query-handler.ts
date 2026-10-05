import type PlayerOwnershipService from '../../../shared/services/player-ownership.service';
import type { PlayerDTO } from '../../dtos/player.dto';
import type { ReadPlayerQuery } from '../read-player.query';

class ReadPlayerQueryHandler {
    private playerOwnershipService: PlayerOwnershipService;

    constructor(params: { playerReadOwnershipService: PlayerOwnershipService }) {
        this.playerOwnershipService = params.playerReadOwnershipService;
    }

    async execute(query: ReadPlayerQuery): Promise<PlayerDTO> {
        const player = await this.playerOwnershipService.getPlayerOwner(query.id, query.userId);
        return player.toJSON<PlayerDTO>();
    }

}

export = ReadPlayerQueryHandler;

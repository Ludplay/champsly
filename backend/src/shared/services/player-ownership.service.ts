import type { PlayerRepository } from '../repositories/player.types';
import { Player } from '../../infra/db/models/player';
import { NotFoundError, ForbiddenError } from '../errors';

class PlayerOwnershipService {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async getPlayerOwner(playerId: number, userId: number): Promise<Player> {
        const player = await this.playerRepository.getOne(playerId);

        if (!player) {
            throw new NotFoundError('Player not found');
        }

        if (player.user_id !== userId) {
            throw new ForbiddenError('You do not have access to this player');
        }

        return player;
    }

    // One generic error for "doesn't exist" and "belongs to someone else", so a
    // roster submission can't be used to probe which player ids exist.
    async assertPlayersOwned(playerIds: number[], userId: number): Promise<void> {
        const uniquePlayerIds = [...new Set(playerIds)];

        if (uniquePlayerIds.length === 0) {
            return;
        }

        const ownedCount = await this.playerRepository.countOwnedByUser(uniquePlayerIds, userId);

        if (ownedCount !== uniquePlayerIds.length) {
            throw new NotFoundError('One or more players were not found');
        }
    }
}

export = PlayerOwnershipService;

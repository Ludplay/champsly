import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type PlayerOwnershipService from '../../../shared/services/player-ownership.service';
import type { UpdatePlayerCommand } from '../update-player.command';

class UpdatePlayerCommandHandler {
    private playerRepository: PlayerRepository;
    private playerOwnershipService: PlayerOwnershipService;

    constructor(params: {
        playerRepository: PlayerRepository;
        playerOwnershipService: PlayerOwnershipService;
    }) {
        this.playerRepository = params.playerRepository;
        this.playerOwnershipService = params.playerOwnershipService;
    }

    async execute(command: UpdatePlayerCommand) {
        await this.playerOwnershipService.getPlayerOwner(command.id, command.userId);

        return await this.playerRepository.update(command.id, command.changes);
    }

}

export = UpdatePlayerCommandHandler;

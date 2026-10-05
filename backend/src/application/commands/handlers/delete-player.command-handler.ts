import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type PlayerOwnershipService from '../../../shared/services/player-ownership.service';
import type { DeletePlayerCommand } from '../delete-player.command';

class DeletePlayerCommandHandler {
    private playerRepository: PlayerRepository;
    private playerOwnershipService: PlayerOwnershipService;

    constructor(params: {
        playerRepository: PlayerRepository;
        playerOwnershipService: PlayerOwnershipService;
    }) {
        this.playerRepository = params.playerRepository;
        this.playerOwnershipService = params.playerOwnershipService;
    }

    async execute(command: DeletePlayerCommand) {
        await this.playerOwnershipService.getPlayerOwner(command.id, command.userId);

        return await this.playerRepository.delete(command.id);
    }

}

export = DeletePlayerCommandHandler;

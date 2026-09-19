import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type { UpdatePlayerCommand } from '../update-player.command';

class UpdatePlayerCommandHandler {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(command: UpdatePlayerCommand) {
        return await this.playerRepository.update(command.id, command.changes);
    }

}

export = UpdatePlayerCommandHandler;

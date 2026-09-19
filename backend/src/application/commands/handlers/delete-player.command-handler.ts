import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type { DeletePlayerCommand } from '../delete-player.command';

class DeletePlayerCommandHandler {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(command: DeletePlayerCommand) {
        return await this.playerRepository.delete(command.id);
    }

}

export = DeletePlayerCommandHandler;

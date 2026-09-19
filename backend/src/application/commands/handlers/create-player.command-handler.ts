import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type { CreatePlayerCommand } from '../create-player.command';

class CreatePlayerCommandHandler {
    private playerRepository: PlayerRepository;

    constructor(params: { playerRepository: PlayerRepository }) {
        this.playerRepository = params.playerRepository;
    }

    async execute(command: CreatePlayerCommand) {
        const inputRecord = {
            name: command.name
        };

        return await this.playerRepository.create(inputRecord);
    }

}

export = CreatePlayerCommandHandler;

import CreatePlayerCommandHandler from '../commands/handlers/create-player.command-handler';
import UpdatePlayerCommandHandler from '../commands/handlers/update-player.command-handler';
import DeletePlayerCommandHandler from '../commands/handlers/delete-player.command-handler';

import CreateTournamentCommandHandler from '../commands/handlers/create-tournament.command-handler';
import UpdateTournamentCommandHandler from '../commands/handlers/update-tournament.command-handler';
import DeleteTournamentCommandHandler from '../commands/handlers/delete-tournament.command-handler';

import CreatePhaseCommandHandler from '../commands/handlers/create-phase.command-handler';
import UpdatePhaseCommandHandler from '../commands/handlers/update-phase.command-handler';
import DeletePhaseCommandHandler from '../commands/handlers/delete-phase.command-handler';
import GenerateGroupsPhaseMatchesCommandHandler from '../commands/handlers/generate-groups-phase-matches.command-handler';

import CreateGroupCommandHandler from '../commands/handlers/create-group.command-handler';
import UpdateGroupCommandHandler from '../commands/handlers/update-group.command-handler';
import DeleteGroupCommandHandler from '../commands/handlers/delete-group.command-handler';

import CreateMatchCommandHandler from '../commands/handlers/create-match.command-handler';
import UpdateMatchCommandHandler from '../commands/handlers/update-match.command-handler';
import DeleteMatchCommandHandler from '../commands/handlers/delete-match.command-handler';

import { CreatePlayerCommand } from '../commands/create-player.command';
import { UpdatePlayerCommand } from '../commands/update-player.command';
import { DeletePlayerCommand } from '../commands/delete-player.command';

import { CreateTournamentCommand } from '../commands/create-tournament.command';
import { UpdateTournamentCommand } from '../commands/update-tournament.command';
import { DeleteTournamentCommand } from '../commands/delete-tournament.command';

import { CreatePhaseCommand } from '../commands/create-phase.command';
import { UpdatePhaseCommand } from '../commands/update-phase.command';
import { DeletePhaseCommand } from '../commands/delete-phase.command';
import { GenerateGroupsPhaseMatchesCommand } from '../commands/generate-groups-phase-matches.command';

import { CreateGroupCommand } from '../commands/create-group.command';
import { UpdateGroupCommand } from '../commands/update-group.command';
import { DeleteGroupCommand } from '../commands/delete-group.command';

import { CreateMatchCommand } from '../commands/create-match.command';
import { UpdateMatchCommand } from '../commands/update-match.command';
import { DeleteMatchCommand } from '../commands/delete-match.command';

type Command =
    | InstanceType<typeof CreatePlayerCommand>
    | InstanceType<typeof UpdatePlayerCommand>
    | InstanceType<typeof DeletePlayerCommand>
    | InstanceType<typeof CreateTournamentCommand>
    | InstanceType<typeof UpdateTournamentCommand>
    | InstanceType<typeof DeleteTournamentCommand>
    | InstanceType<typeof CreatePhaseCommand>
    | InstanceType<typeof UpdatePhaseCommand>
    | InstanceType<typeof DeletePhaseCommand>
    | InstanceType<typeof GenerateGroupsPhaseMatchesCommand>
    | InstanceType<typeof CreateGroupCommand>
    | InstanceType<typeof UpdateGroupCommand>
    | InstanceType<typeof DeleteGroupCommand>
    | InstanceType<typeof CreateMatchCommand>
    | InstanceType<typeof UpdateMatchCommand>
    | InstanceType<typeof DeleteMatchCommand>;

interface CommandHandler<TResult = unknown> {
    execute(command: Command): Promise<TResult>;
}

class CommandBus {
    private handlers = new Map<Function, CommandHandler>();

    constructor(params: {
        createPlayerCommandHandler: CreatePlayerCommandHandler;
        updatePlayerCommandHandler: UpdatePlayerCommandHandler;
        deletePlayerCommandHandler: DeletePlayerCommandHandler;

        createTournamentCommandHandler: CreateTournamentCommandHandler;
        updateTournamentCommandHandler: UpdateTournamentCommandHandler;
        deleteTournamentCommandHandler: DeleteTournamentCommandHandler;

        createPhaseCommandHandler: CreatePhaseCommandHandler;
        updatePhaseCommandHandler: UpdatePhaseCommandHandler;
        deletePhaseCommandHandler: DeletePhaseCommandHandler;
        generateGroupsPhaseMatchesCommandHandler: GenerateGroupsPhaseMatchesCommandHandler;

        createGroupCommandHandler: CreateGroupCommandHandler;
        updateGroupCommandHandler: UpdateGroupCommandHandler;
        deleteGroupCommandHandler: DeleteGroupCommandHandler;

        createMatchCommandHandler: CreateMatchCommandHandler;
        updateMatchCommandHandler: UpdateMatchCommandHandler;
        deleteMatchCommandHandler: DeleteMatchCommandHandler;
    }) {
        this.handlers.set(CreatePlayerCommand, params.createPlayerCommandHandler);
        this.handlers.set(UpdatePlayerCommand, params.updatePlayerCommandHandler);
        this.handlers.set(DeletePlayerCommand, params.deletePlayerCommandHandler);

        this.handlers.set(CreateTournamentCommand, params.createTournamentCommandHandler);
        this.handlers.set(UpdateTournamentCommand, params.updateTournamentCommandHandler);
        this.handlers.set(DeleteTournamentCommand, params.deleteTournamentCommandHandler);

        this.handlers.set(CreatePhaseCommand, params.createPhaseCommandHandler);
        this.handlers.set(UpdatePhaseCommand, params.updatePhaseCommandHandler);
        this.handlers.set(DeletePhaseCommand, params.deletePhaseCommandHandler);
        this.handlers.set(GenerateGroupsPhaseMatchesCommand, params.generateGroupsPhaseMatchesCommandHandler);

        this.handlers.set(CreateGroupCommand, params.createGroupCommandHandler);
        this.handlers.set(UpdateGroupCommand, params.updateGroupCommandHandler);
        this.handlers.set(DeleteGroupCommand, params.deleteGroupCommandHandler);

        this.handlers.set(CreateMatchCommand, params.createMatchCommandHandler);
        this.handlers.set(UpdateMatchCommand, params.updateMatchCommandHandler);
        this.handlers.set(DeleteMatchCommand, params.deleteMatchCommandHandler);
    }

    async execute<TResult = unknown>(command: Command): Promise<TResult> {
        const handler = this.handlers.get(command.constructor);

        if (!handler) {
            throw new Error(`No command handler registered for command: ${command.constructor.name}`);
        }

        return handler.execute(command) as Promise<TResult>;
    }
}

export = CommandBus;

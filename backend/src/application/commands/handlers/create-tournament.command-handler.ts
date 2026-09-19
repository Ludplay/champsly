import { CreationAttributes } from 'sequelize';
import type { TournamentRepository } from '../../../shared/repositories/tournament.types';
import type { GroupRepository } from '../../../shared/repositories/group.types';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type { EventBus } from '../../../shared/events/event-bus.types';
import { Tournament } from '../../../infra/db/models/tournament';
import { isTournamentStatus } from '../../../shared/value-objects';
import { ValidationError } from '../../../shared/errors';
import { TournamentCreated } from '../../../shared/events';
import type { CreateTournamentCommand } from '../create-tournament.command';

interface TournamentPlayerInput {
    player_id: number;
}

class CreateTournamentCommandHandler {
    private tournamentRepository: TournamentRepository;
    private groupRepository: GroupRepository;
    private phaseRepository: PhaseRepository;
    private eventBus: EventBus;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        groupRepository: GroupRepository;
        phaseRepository: PhaseRepository;
        eventBus: EventBus;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.groupRepository = params.groupRepository;
        this.phaseRepository = params.phaseRepository;
        this.eventBus = params.eventBus;
    }

    async execute(command: CreateTournamentCommand) {
        const { name, groups_quantity, phases_quantity, status, players, userId } = command;

        if (!isTournamentStatus(status)) {
            throw new ValidationError(`Invalid tournament status: ${status}`);
        }

        const inputRecord: CreationAttributes<Tournament> = {
            name,
            groups_quantity,
            phases_quantity,
            status,
            user_id: userId
        };

        const tournament = await this.tournamentRepository.create(inputRecord);

        // Stores the tournament's players
        const playersIds = await this.storeTournamentPlayers(tournament, players);

        // Creates groups
        const groupsIds = await this.createTournamentGroups(tournament.id, groups_quantity);

        // Creates phases
        await this.createTournamentPhases(tournament.id, phases_quantity);

        // Add players in groups
        await this.assignPlayersToGroups(groupsIds, playersIds);

        // Only announce the tournament exists once every write it depends on has succeeded
        await this.eventBus.publish(new TournamentCreated(tournament.id, tournament.name));

        return tournament;
    }

    private async storeTournamentPlayers(tournament: Tournament, players: TournamentPlayerInput[]) {
        const playersIds: number[] = [];
        players.forEach(player => {
            playersIds.push(player.player_id);
        });

        await tournament.addPlayers(playersIds);

        return playersIds;
    }

    private async createTournamentGroups(tournamentId: number, groupsQuantity: number) {

        const groupsIds: number[] = [];

        for (let i=1; i <= groupsQuantity; i++) {
            const groupInput = {
                tournament_id: tournamentId,
                name: `Group ${i}`,
                number: i
            }

            const group = await this.groupRepository.create(groupInput);
            groupsIds.push(group.id);

        }

        return groupsIds;
    }

    private async createTournamentPhases(tournamentId: number, phasesQuantity: number) {

        const phasesIds: number[] = [];

        for (let i=1; i <= phasesQuantity; i++) {
            const phaseInput = {
                tournament_id: tournamentId,
                name: `Phase ${i}`,
                number: i,
                status: 'waiting'
            }

            const phase = await this.phaseRepository.create(phaseInput);
            phasesIds.push(phase.id);
        }

        return phasesIds;
    }

    private async assignPlayersToGroups(groupsIds: number[], playersIds: number[]) {

        //sort randomly
        const sortedPlayersIds = [...playersIds].sort(() => Math.random() - 0.5);

        let indexGroup = 0;
        for (let i=0; i < sortedPlayersIds.length; i++) {
            const groupId = groupsIds[indexGroup];
            const playerId = sortedPlayersIds[i];

            await this.groupRepository.addPlayerInGroup(playerId, groupId);

            indexGroup++;

            if (indexGroup === groupsIds.length) {
                indexGroup = 0;
            }
        }
    }

}

export = CreateTournamentCommandHandler;

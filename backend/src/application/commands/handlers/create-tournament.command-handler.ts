import { CreationAttributes } from 'sequelize';
import type { TournamentRepository } from '../../../shared/repositories/tournament.types';
import type { GroupRepository } from '../../../shared/repositories/group.types';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type { OutboxRepository } from '../../../shared/repositories/outbox.types';
import type PlayerOwnershipService from '../../../shared/services/player-ownership.service';
import type { TransactionManager, TransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import { Tournament } from '../../../infra/db/models/tournament';
import { isTournamentStatus, PhaseStatus } from '../../../shared/value-objects';
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
    private outboxRepository: OutboxRepository;
    private transactionManager: TransactionManager;
    private playerOwnershipService: PlayerOwnershipService;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        groupRepository: GroupRepository;
        phaseRepository: PhaseRepository;
        outboxRepository: OutboxRepository;
        transactionManager: TransactionManager;
        playerOwnershipService: PlayerOwnershipService;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.groupRepository = params.groupRepository;
        this.phaseRepository = params.phaseRepository;
        this.outboxRepository = params.outboxRepository;
        this.transactionManager = params.transactionManager;
        this.playerOwnershipService = params.playerOwnershipService;
    }

    async execute(command: CreateTournamentCommand) {
        const { name, groups_quantity, phases_quantity, status, players, userId } = command;

        if (!isTournamentStatus(status)) {
            throw new ValidationError(`Invalid tournament status: ${status}`);
        }

        const rosterPlayerIds = players.map((player) => player.player_id);
        await this.playerOwnershipService.assertPlayersOwned(rosterPlayerIds, userId);

        const inputRecord: CreationAttributes<Tournament> = {
            name,
            groups_quantity,
            phases_quantity,
            status,
            user_id: userId
        };

        return await this.transactionManager.run(async (transaction) => {
            const transactionOptions: TransactionOptions = { transaction };

            const tournament = await this.tournamentRepository.create(inputRecord, transactionOptions);

            // Stores the tournament's players
            const playersIds = await this.storeTournamentPlayers(tournament, players, transactionOptions);

            // Creates groups
            const groupsIds = await this.createTournamentGroups(tournament.id, groups_quantity, transactionOptions);

            // Creates phases
            await this.createTournamentPhases(tournament.id, phases_quantity, transactionOptions);

            // Add players in groups
            await this.assignPlayersToGroups(groupsIds, playersIds, transactionOptions);

            // Committed together with the tournament, so the event exists exactly when the tournament does
            const tournamentCreatedEvent = new TournamentCreated(tournament.id, tournament.name);
            await this.outboxRepository.add(tournamentCreatedEvent, { transaction });

            return tournament;
        });
    }

    private async storeTournamentPlayers(tournament: Tournament, players: TournamentPlayerInput[], transactionOptions: TransactionOptions) {
        const playersIds: number[] = [];
        players.forEach(player => {
            playersIds.push(player.player_id);
        });

        await tournament.addPlayers(playersIds, transactionOptions);

        return playersIds;
    }

    private async createTournamentGroups(tournamentId: number, groupsQuantity: number, transactionOptions: TransactionOptions) {

        const groupsIds: number[] = [];

        for (let i=1; i <= groupsQuantity; i++) {
            const groupInput = {
                tournament_id: tournamentId,
                name: `Group ${i}`,
                number: i
            }

            const group = await this.groupRepository.create(groupInput, transactionOptions);
            groupsIds.push(group.id);

        }

        return groupsIds;
    }

    private async createTournamentPhases(tournamentId: number, phasesQuantity: number, transactionOptions: TransactionOptions) {

        const phasesIds: number[] = [];

        for (let i=1; i <= phasesQuantity; i++) {
            const phaseInput = {
                tournament_id: tournamentId,
                name: `Phase ${i}`,
                number: i,
                status: PhaseStatus.Waiting
            }

            const phase = await this.phaseRepository.create(phaseInput, transactionOptions);
            phasesIds.push(phase.id);
        }

        return phasesIds;
    }

    private async assignPlayersToGroups(groupsIds: number[], playersIds: number[], transactionOptions: TransactionOptions) {

        //sort randomly
        const sortedPlayersIds = [...playersIds].sort(() => Math.random() - 0.5);

        let indexGroup = 0;
        for (let i=0; i < sortedPlayersIds.length; i++) {
            const groupId = groupsIds[indexGroup];
            const playerId = sortedPlayersIds[i];

            await this.groupRepository.addPlayerInGroup(playerId, groupId, transactionOptions);

            indexGroup++;

            if (indexGroup === groupsIds.length) {
                indexGroup = 0;
            }
        }
    }

}

export = CreateTournamentCommandHandler;

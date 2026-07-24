import { CreationAttributes } from 'sequelize';
import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import CreateGroupInteractor from '../groups/create-group.bs';
import CreatePhaseInteractor from '../phases/create-phase.bs';
import { Tournament } from '../../infra/db/models/tournament';

interface TournamentPlayerInput {
    player_id: number;
}

interface CreateTournamentInput {
    name: string;
    groups_quantity: number;
    phases_quantity: number;
    status: string;
    players: TournamentPlayerInput[];
}

class CreateTournamentInteractor {
    private tournamentRepository: TournamentRepository;
    private createGroupInteractor: CreateGroupInteractor;
    private createPhaseInteractor: CreatePhaseInteractor;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        createGroupInteractor: CreateGroupInteractor;
        createPhaseInteractor: CreatePhaseInteractor;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.createGroupInteractor = params.createGroupInteractor;
        this.createPhaseInteractor = params.createPhaseInteractor;
    }

    async execute(input: CreateTournamentInput) {
        const { name, groups_quantity, phases_quantity, status, players } = input;

        const inputRecord: CreationAttributes<Tournament> = {
            name,
            groups_quantity,
            phases_quantity,
            status
        };

        const tournament = await this.tournamentRepository.create(inputRecord);

        // Stores the tournament's players
        const playersIds = await this.storeTournamentPlayers(tournament, players);

        // Creates groups
        const groupsIds = await this.createTournamentGroups(tournament.id, groups_quantity);

        // Creates phases
        const phasesIds = await this.createTournamentPhases(tournament.id, phases_quantity);

        // Add players in groups
        await this.addPlayersInGroups(groupsIds, playersIds);

        // Create matches for phase 1 (groups phase)
        //await this.createMatchesPhaseGroups(phasesIds[0]);

        return tournament;
    }

    async storeTournamentPlayers(tournament: Tournament, players: TournamentPlayerInput[]) {
        const playersIds: number[] = [];
        players.forEach(player => {
            playersIds.push(player.player_id);
        });

        await tournament.addPlayers(playersIds);

        return playersIds;
    }

    async createTournamentGroups(tournamentId: number, groupsQuantity: number) {

        const groupsIds: number[] = [];

        for (let i=1; i <= groupsQuantity; i++) {
            const groupInput = {
                tournament_id: tournamentId,
                name: `Group ${i}`,
                number: i
            }

            const group = await this.createGroupInteractor.execute(groupInput);
            groupsIds.push(group.id);

        }

        return groupsIds;
    }

    async createTournamentPhases(tournamentId: number, phasesQuantity: number) {

        const phasesIds: number[] = [];

        for (let i=1; i <= phasesQuantity; i++) {
            const phaseInput = {
                tournament_id: tournamentId,
                name: `Phase ${i}`,
                number: i,
                status: 'waiting'
            }

            const phase = await this.createPhaseInteractor.execute(phaseInput);
            phasesIds.push(phase.id);
        }

        return phasesIds;
    }

    async addPlayersInGroups(groupsIds: number[], playersIds: number[]) {
        await this.createGroupInteractor.addPlayersInGroups(groupsIds, playersIds);
    }

    async createMatchesPhaseGroups(phaseId: number) {
        await this.createPhaseInteractor.createMatchesPhaseGroups(phaseId);
    }

}

export = CreateTournamentInteractor;

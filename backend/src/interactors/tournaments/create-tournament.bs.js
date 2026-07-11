const { now } = require("sequelize/lib/utils");

class CreateTournamentInteractor {

    constructor(params) {
        this.tournamentRepository = params.tournamentRepository;
        this.createGroupInteractor = params.createGroupInteractor;
        this.createPhaseInteractor = params.createPhaseInteractor;
    }

    async execute(input) {
        const { name, groups_quantity, phases_quantity, status, players } = input;

        const inputRecord = {
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

    async storeTournamentPlayers(tournament, players) {
        const playersIds = [];
        players.forEach(player => {
            playersIds.push(player.player_id);
        });

        await tournament.addPlayers(playersIds);

        return playersIds;
    }

    async createTournamentGroups(tournamentId, groupsQuantity) {
        
        const groupsIds = [];

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

    async createTournamentPhases(tournamentId, phasesQuantity) {
        
        const phasesIds = [];
        
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
    
    async addPlayersInGroups(groupsIds, playersIds) {
        await this.createGroupInteractor.addPlayersInGroups(groupsIds, playersIds);
    }

    async createMatchesPhaseGroups(phaseId) {        
        await this.createPhaseInteractor.createMatchesPhaseGroups(phaseId);
    }

}

module.exports = CreateTournamentInteractor;

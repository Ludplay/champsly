
class CreatePhaseInteractor {

    constructor(params) {
        this.phaseRepository = params.phaseRepository;
        this.groupRepository = params.groupRepository;
        this.createMatchInteractor = params.createMatchInteractor;
        this.logger = params.logger;
    }

    async execute(input) {
        const { tournament_id, name, status, number } = input;

        const inputRecord = {
            tournament_id,
            name,
            status,
            number
        };

        return await this.phaseRepository.create(inputRecord);
    }

    async createMatchesPhaseGroups(phaseId) {
        const phaseData = await this.phaseRepository.getOne(phaseId);
        if (!phaseData) {
            throw new Error(`Phase ${phaseId} not found`);
        }

        const tournamentId = phaseData.tournament_id;
        const groups = await this.groupRepository.getTournamentGroups(tournamentId);

        for (const group of groups) {
            const players = group.Players || [];
            this.logger.debug({ groupId: group.id, players }, 'Group players');
            await this.implementRoundRobinGroup(group, players, phaseId);
        }
    }

    async implementRoundRobinGroup(group, players, phaseId) {
        if (!Array.isArray(players) || players.length < 2) {
            return;
        }

        const pairs = [];
        for (let i = 0; i < players.length - 1; i++) {
            for (let j = i + 1; j < players.length; j++) {
                pairs.push([players[i], players[j]]);
            }
        }

        if (pairs.length !== (players.length * (players.length - 1)) / 2) {
            throw new Error(`Unexpected pair count for group ${group.id}: ${pairs.length} (players=${players.length})`);
        }

        let roundNumber = 1;
        for (const [player1, player2] of pairs) {
            if (!player1 || !player1.id || !player2 || !player2.id) {
                throw new Error(`Invalid players for group ${group.id}: ${JSON.stringify({ player1, player2 })}`);
            }

            const matchInput = {
                player1_id: player1.id,
                player2_id: player2.id,
                phase_id: phaseId,
                group_id: group.id,
                round_number: roundNumber,
                status: 'waiting'
            };

            await this.createMatchInteractor.execute(matchInput);
            roundNumber += 1;
        }
    }

}

module.exports = CreatePhaseInteractor;

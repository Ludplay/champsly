
class GetGroupsInteractor {

    constructor(params) {
        this.groupRepository = params.groupRepository;
    }

    async execute() {
        return await this.groupRepository.getAll();
    }

    async executeByTournament(tournamentId) {
        return await this.groupRepository.getTournamentGroups(tournamentId);
    }

}

module.exports = GetGroupsInteractor;

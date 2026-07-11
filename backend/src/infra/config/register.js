// Awilix methods
const { createContainer, asClass, asFunction, asValue} = require('awilix');

const logger = require('./logger');

// Repositories and Interactors
const PlayerRepository = require('../../adapters/repositories/players.rep');
const TournamentRepository = require('../../adapters/repositories/tournaments.rep');
const PhaseRepository = require('../../adapters/repositories/phases.rep');
const GroupRepository = require('../../adapters/repositories/groups.rep');
const MatchRepository = require('../../adapters/repositories/matchs.rep');

const GetPlayersInteractor = require('../../interactors/players/get-players.bs');
const CreatePlayerInteractor = require('../../interactors/players/create-player.bs');
const ReadPlayerInteractor = require('../../interactors/players/read-player.bs');
const UpdatePlayerInteractor = require('../../interactors/players/update-player.bs');
const DeletePlayerInteractor = require('../../interactors/players/delete-player.bs');

const GetTournamentsInteractor = require('../../interactors/tournaments/get-tournaments.bs');
const CreateTournamentInteractor = require('../../interactors/tournaments/create-tournament.bs');
const ReadTournamentInteractor = require('../../interactors/tournaments/read-tournament.bs');
const UpdateTournamentInteractor = require('../../interactors/tournaments/update-tournament.bs');
const DeleteTournamentInteractor = require('../../interactors/tournaments/delete-tournament.bs');

const GetPhasesInteractor = require('../../interactors/phases/get-phases.bs');
const CreatePhaseInteractor = require('../../interactors/phases/create-phase.bs');
const ReadPhaseInteractor = require('../../interactors/phases/read-phase.bs');
const UpdatePhaseInteractor = require('../../interactors/phases/update-phase.bs');
const DeletePhaseInteractor = require('../../interactors/phases/delete-phase.bs');
const GenerateGroupsPhaseMatchesInteractor = require('../../interactors/phases/generate-groups-phase-matches.bs');

const GetGroupsInteractor = require('../../interactors/groups/get-groups.bs');
const CreateGroupInteractor = require('../../interactors/groups/create-group.bs');
const ReadGroupInteractor = require('../../interactors/groups/read-group.bs');
const UpdateGroupInteractor = require('../../interactors/groups/update-group.bs');
const DeleteGroupInteractor = require('../../interactors/groups/delete-group.bs');

const GetMatchsInteractor = require('../../interactors/matchs/get-matchs.bs');
const GetTournamentMatchsInteractor = require('../../interactors/matchs/get-tournament-matchs.bs');
const CreateMatchInteractor = require('../../interactors/matchs/create-match.bs');
const ReadMatchInteractor = require('../../interactors/matchs/read-match.bs');
const UpdateMatchInteractor = require('../../interactors/matchs/update-match.bs');
const DeleteMatchInteractor = require('../../interactors/matchs/delete-match.bs');

// Models (all at once)
const models = require('../db/models');

// Container creation
const container = createContainer();

// Register
container.register({
    playerRepository: asClass(PlayerRepository).scoped(),
    getPlayersInteractor: asClass(GetPlayersInteractor).scoped(),
    createPlayerInteractor: asClass(CreatePlayerInteractor).scoped(),
    readPlayerInteractor: asClass(ReadPlayerInteractor).scoped(),
    updatePlayerInteractor: asClass(UpdatePlayerInteractor).scoped(),
    deletePlayerInteractor: asClass(DeletePlayerInteractor).scoped(),

    tournamentRepository: asClass(TournamentRepository).scoped(),
    getTournamentsInteractor: asClass(GetTournamentsInteractor).scoped(),
    createTournamentInteractor: asClass(CreateTournamentInteractor).scoped(),
    readTournamentInteractor: asClass(ReadTournamentInteractor).scoped(),
    updateTournamentInteractor: asClass(UpdateTournamentInteractor).scoped(),
    deleteTournamentInteractor: asClass(DeleteTournamentInteractor).scoped(),

    phaseRepository: asClass(PhaseRepository).scoped(),
    getPhasesInteractor: asClass(GetPhasesInteractor).scoped(),
    createPhaseInteractor: asClass(CreatePhaseInteractor).scoped(),
    readPhaseInteractor: asClass(ReadPhaseInteractor).scoped(),
    updatePhaseInteractor: asClass(UpdatePhaseInteractor).scoped(),
    deletePhaseInteractor: asClass(DeletePhaseInteractor).scoped(),
    generateGroupsPhaseMatchesInteractor: asClass(GenerateGroupsPhaseMatchesInteractor).scoped(),

    groupRepository: asClass(GroupRepository).scoped(),
    getGroupsInteractor: asClass(GetGroupsInteractor).scoped(),
    createGroupInteractor: asClass(CreateGroupInteractor).scoped(),
    readGroupInteractor: asClass(ReadGroupInteractor).scoped(),
    updateGroupInteractor: asClass(UpdateGroupInteractor).scoped(),
    deleteGroupInteractor: asClass(DeleteGroupInteractor).scoped(),

    matchRepository: asClass(MatchRepository).scoped(),
    getMatchsInteractor: asClass(GetMatchsInteractor).scoped(),
    getTournamentMatchsInteractor: asClass(GetTournamentMatchsInteractor).scoped(),
    createMatchInteractor: asClass(CreateMatchInteractor).scoped(),
    readMatchInteractor: asClass(ReadMatchInteractor).scoped(),
    updateMatchInteractor: asClass(UpdateMatchInteractor).scoped(),
    deleteMatchInteractor: asClass(DeleteMatchInteractor).scoped(),

    models: asValue(models),
    logger: asValue(logger)
});

module.exports = container;
// Awilix methods
import { createContainer, asClass, asValue, AwilixContainer } from 'awilix';

import logger from './logger';
import models from '../db/models';
import type { Db } from '../db/models/models.types';

// Repositories and Interactors
import SequelizePlayerRepository from '../../adapters/repositories/players.rep';
import SequelizeTournamentRepository from '../../adapters/repositories/tournaments.rep';
import SequelizePhaseRepository from '../../adapters/repositories/phases.rep';
import SequelizeGroupRepository from '../../adapters/repositories/groups.rep';
import SequelizeMatchRepository from '../../adapters/repositories/matchs.rep';

import type { PlayerRepository } from '../../shared/repositories/player.types';
import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import type { GroupRepository } from '../../shared/repositories/group.types';
import type { MatchRepository } from '../../shared/repositories/match.types';

import GetPlayersInteractor from '../../interactors/players/get-players.bs';
import CreatePlayerInteractor from '../../interactors/players/create-player.bs';
import ReadPlayerInteractor from '../../interactors/players/read-player.bs';
import UpdatePlayerInteractor from '../../interactors/players/update-player.bs';
import DeletePlayerInteractor from '../../interactors/players/delete-player.bs';

import GetTournamentsInteractor from '../../interactors/tournaments/get-tournaments.bs';
import CreateTournamentInteractor from '../../interactors/tournaments/create-tournament.bs';
import ReadTournamentInteractor from '../../interactors/tournaments/read-tournament.bs';
import UpdateTournamentInteractor from '../../interactors/tournaments/update-tournament.bs';
import DeleteTournamentInteractor from '../../interactors/tournaments/delete-tournament.bs';

import GetPhasesInteractor from '../../interactors/phases/get-phases.bs';
import CreatePhaseInteractor from '../../interactors/phases/create-phase.bs';
import ReadPhaseInteractor from '../../interactors/phases/read-phase.bs';
import UpdatePhaseInteractor from '../../interactors/phases/update-phase.bs';
import DeletePhaseInteractor from '../../interactors/phases/delete-phase.bs';
import GenerateGroupsPhaseMatchesInteractor from '../../interactors/phases/generate-groups-phase-matches.bs';

import GetGroupsInteractor from '../../interactors/groups/get-groups.bs';
import CreateGroupInteractor from '../../interactors/groups/create-group.bs';
import ReadGroupInteractor from '../../interactors/groups/read-group.bs';
import UpdateGroupInteractor from '../../interactors/groups/update-group.bs';
import DeleteGroupInteractor from '../../interactors/groups/delete-group.bs';

import GetMatchsInteractor from '../../interactors/matchs/get-matchs.bs';
import GetTournamentMatchsInteractor from '../../interactors/matchs/get-tournament-matchs.bs';
import CreateMatchInteractor from '../../interactors/matchs/create-match.bs';
import ReadMatchInteractor from '../../interactors/matchs/read-match.bs';
import UpdateMatchInteractor from '../../interactors/matchs/update-match.bs';
import DeleteMatchInteractor from '../../interactors/matchs/delete-match.bs';

export interface Cradle {
    playerRepository: PlayerRepository;
    getPlayersInteractor: GetPlayersInteractor;
    createPlayerInteractor: CreatePlayerInteractor;
    readPlayerInteractor: ReadPlayerInteractor;
    updatePlayerInteractor: UpdatePlayerInteractor;
    deletePlayerInteractor: DeletePlayerInteractor;

    tournamentRepository: TournamentRepository;
    getTournamentsInteractor: GetTournamentsInteractor;
    createTournamentInteractor: CreateTournamentInteractor;
    readTournamentInteractor: ReadTournamentInteractor;
    updateTournamentInteractor: UpdateTournamentInteractor;
    deleteTournamentInteractor: DeleteTournamentInteractor;

    phaseRepository: PhaseRepository;
    getPhasesInteractor: GetPhasesInteractor;
    createPhaseInteractor: CreatePhaseInteractor;
    readPhaseInteractor: ReadPhaseInteractor;
    updatePhaseInteractor: UpdatePhaseInteractor;
    deletePhaseInteractor: DeletePhaseInteractor;
    generateGroupsPhaseMatchesInteractor: GenerateGroupsPhaseMatchesInteractor;

    groupRepository: GroupRepository;
    getGroupsInteractor: GetGroupsInteractor;
    createGroupInteractor: CreateGroupInteractor;
    readGroupInteractor: ReadGroupInteractor;
    updateGroupInteractor: UpdateGroupInteractor;
    deleteGroupInteractor: DeleteGroupInteractor;

    matchRepository: MatchRepository;
    getMatchsInteractor: GetMatchsInteractor;
    getTournamentMatchsInteractor: GetTournamentMatchsInteractor;
    createMatchInteractor: CreateMatchInteractor;
    readMatchInteractor: ReadMatchInteractor;
    updateMatchInteractor: UpdateMatchInteractor;
    deleteMatchInteractor: DeleteMatchInteractor;

    models: Db;
    logger: typeof logger;
}

// Container creation
const container: AwilixContainer<Cradle> = createContainer<Cradle>();

// Register
container.register({
    playerRepository: asClass(SequelizePlayerRepository).scoped(),
    getPlayersInteractor: asClass(GetPlayersInteractor).scoped(),
    createPlayerInteractor: asClass(CreatePlayerInteractor).scoped(),
    readPlayerInteractor: asClass(ReadPlayerInteractor).scoped(),
    updatePlayerInteractor: asClass(UpdatePlayerInteractor).scoped(),
    deletePlayerInteractor: asClass(DeletePlayerInteractor).scoped(),

    tournamentRepository: asClass(SequelizeTournamentRepository).scoped(),
    getTournamentsInteractor: asClass(GetTournamentsInteractor).scoped(),
    createTournamentInteractor: asClass(CreateTournamentInteractor).scoped(),
    readTournamentInteractor: asClass(ReadTournamentInteractor).scoped(),
    updateTournamentInteractor: asClass(UpdateTournamentInteractor).scoped(),
    deleteTournamentInteractor: asClass(DeleteTournamentInteractor).scoped(),

    phaseRepository: asClass(SequelizePhaseRepository).scoped(),
    getPhasesInteractor: asClass(GetPhasesInteractor).scoped(),
    createPhaseInteractor: asClass(CreatePhaseInteractor).scoped(),
    readPhaseInteractor: asClass(ReadPhaseInteractor).scoped(),
    updatePhaseInteractor: asClass(UpdatePhaseInteractor).scoped(),
    deletePhaseInteractor: asClass(DeletePhaseInteractor).scoped(),
    generateGroupsPhaseMatchesInteractor: asClass(GenerateGroupsPhaseMatchesInteractor).scoped(),

    groupRepository: asClass(SequelizeGroupRepository).scoped(),
    getGroupsInteractor: asClass(GetGroupsInteractor).scoped(),
    createGroupInteractor: asClass(CreateGroupInteractor).scoped(),
    readGroupInteractor: asClass(ReadGroupInteractor).scoped(),
    updateGroupInteractor: asClass(UpdateGroupInteractor).scoped(),
    deleteGroupInteractor: asClass(DeleteGroupInteractor).scoped(),

    matchRepository: asClass(SequelizeMatchRepository).scoped(),
    getMatchsInteractor: asClass(GetMatchsInteractor).scoped(),
    getTournamentMatchsInteractor: asClass(GetTournamentMatchsInteractor).scoped(),
    createMatchInteractor: asClass(CreateMatchInteractor).scoped(),
    readMatchInteractor: asClass(ReadMatchInteractor).scoped(),
    updateMatchInteractor: asClass(UpdateMatchInteractor).scoped(),
    deleteMatchInteractor: asClass(DeleteMatchInteractor).scoped(),

    models: asValue(models),
    logger: asValue(logger)
});

export default container;

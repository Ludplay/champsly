// Awilix methods
import { createContainer, asClass, asValue, AwilixContainer } from 'awilix';

import logger from './logger';
import { db as models, readDb as readModels } from '../db/models';
import type { Db } from '../db/models/models.types';

// Sequelize Repositories
import SequelizePlayerRepository from '../adapters/repositories/players.rep';
import SequelizeTournamentRepository from '../adapters/repositories/tournaments.rep';
import SequelizePhaseRepository from '../adapters/repositories/phases.rep';
import SequelizeGroupRepository from '../adapters/repositories/groups.rep';
import SequelizeMatchRepository from '../adapters/repositories/matchs.rep';
import SequelizeUserRepository from '../adapters/repositories/users.rep';
import SequelizeRefreshTokenRepository from '../adapters/repositories/refresh-tokens.rep';
import SequelizeEmailVerificationTokenRepository from '../adapters/repositories/email-verification-tokens.rep';

// Mail
import ConsoleEmailSender from '../adapters/mail/console-email-sender';

// Interface Repositories
import type { PlayerRepository } from '../../shared/repositories/player.types';
import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import type { GroupRepository, GroupReadRepository } from '../../shared/repositories/group.types';
import type { MatchRepository } from '../../shared/repositories/match.types';
import type { UserRepository } from '../../shared/repositories/user.types';
import type { RefreshTokenRepository } from '../../shared/repositories/refresh-token.types';
import type { EmailVerificationTokenRepository } from '../../shared/repositories/email-verification-token.types';
import type { EventBus } from '../../shared/events/event-bus.types';
import type { EmailSender } from '../../shared/mail/email-sender.types';

// Query handlers (reads)
import GetPlayersQueryHandler from '../../application/queries/handlers/get-players.query-handler';
import ReadPlayerQueryHandler from '../../application/queries/handlers/read-player.query-handler';

import GetTournamentsQueryHandler from '../../application/queries/handlers/get-tournaments.query-handler';
import ReadTournamentQueryHandler from '../../application/queries/handlers/read-tournament.query-handler';

import GetPhasesQueryHandler from '../../application/queries/handlers/get-phases.query-handler';
import ReadPhaseQueryHandler from '../../application/queries/handlers/read-phase.query-handler';

import GetGroupsQueryHandler from '../../application/queries/handlers/get-groups.query-handler';
import GetTournamentGroupsQueryHandler from '../../application/queries/handlers/get-tournament-groups.query-handler';
import ReadGroupQueryHandler from '../../application/queries/handlers/read-group.query-handler';

import GetMatchsQueryHandler from '../../application/queries/handlers/get-matchs.query-handler';
import GetTournamentMatchesQueryHandler from '../../application/queries/handlers/get-tournament-matches.query-handler';
import ReadMatchQueryHandler from '../../application/queries/handlers/read-match.query-handler';

// Command handlers (writes)
import CreatePlayerCommandHandler from '../../application/commands/handlers/create-player.command-handler';
import UpdatePlayerCommandHandler from '../../application/commands/handlers/update-player.command-handler';
import DeletePlayerCommandHandler from '../../application/commands/handlers/delete-player.command-handler';

import CreateTournamentCommandHandler from '../../application/commands/handlers/create-tournament.command-handler';
import UpdateTournamentCommandHandler from '../../application/commands/handlers/update-tournament.command-handler';
import DeleteTournamentCommandHandler from '../../application/commands/handlers/delete-tournament.command-handler';

import CreatePhaseCommandHandler from '../../application/commands/handlers/create-phase.command-handler';
import UpdatePhaseCommandHandler from '../../application/commands/handlers/update-phase.command-handler';
import DeletePhaseCommandHandler from '../../application/commands/handlers/delete-phase.command-handler';
import GenerateGroupsPhaseMatchesCommandHandler from '../../application/commands/handlers/generate-groups-phase-matches.command-handler';

import CreateGroupCommandHandler from '../../application/commands/handlers/create-group.command-handler';
import UpdateGroupCommandHandler from '../../application/commands/handlers/update-group.command-handler';
import DeleteGroupCommandHandler from '../../application/commands/handlers/delete-group.command-handler';

import CreateMatchCommandHandler from '../../application/commands/handlers/create-match.command-handler';
import UpdateMatchCommandHandler from '../../application/commands/handlers/update-match.command-handler';
import DeleteMatchCommandHandler from '../../application/commands/handlers/delete-match.command-handler';

// Auth interactors (not part of the command/query split — see Cradle notes)
import RegistrationInteractor from '../../interactors/auth/registration.bs';
import VerifyEmailInteractor from '../../interactors/auth/verify-email.bs';
import LoginInteractor from '../../interactors/auth/login.bs';
import RefreshInteractor from '../../interactors/auth/refresh.bs';
import LogoutInteractor from '../../interactors/auth/logout.bs';
import ResendVerificationInteractor from '../../interactors/auth/resend-verification.bs';

// Buses
import CommandBus from '../../application/bus/command-bus';
import QueryBus from '../../application/bus/query-bus';

// Subscribers
import SendVerificationEmailOnUserRegisteredSubscriber from '../events/subscribers/send-verification-email-on-user-registered';

// Services
import TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

// Aux
import InMemoryEventBus from '../adapters/events/in-memory-event-bus';
import PasswordHasher from '../auth/password-hasher';
import TokenService from '../auth/token-service';

export interface Cradle {
    playerRepository: PlayerRepository;
    playerReadRepository: PlayerRepository;
    getPlayersQueryHandler: GetPlayersQueryHandler;
    createPlayerCommandHandler: CreatePlayerCommandHandler;
    readPlayerQueryHandler: ReadPlayerQueryHandler;
    updatePlayerCommandHandler: UpdatePlayerCommandHandler;
    deletePlayerCommandHandler: DeletePlayerCommandHandler;

    tournamentRepository: TournamentRepository;
    tournamentReadRepository: TournamentRepository;
    getTournamentsQueryHandler: GetTournamentsQueryHandler;
    createTournamentCommandHandler: CreateTournamentCommandHandler;
    readTournamentQueryHandler: ReadTournamentQueryHandler;
    updateTournamentCommandHandler: UpdateTournamentCommandHandler;
    deleteTournamentCommandHandler: DeleteTournamentCommandHandler;

    phaseRepository: PhaseRepository;
    phaseReadRepository: PhaseRepository;
    getPhasesQueryHandler: GetPhasesQueryHandler;
    createPhaseCommandHandler: CreatePhaseCommandHandler;
    readPhaseQueryHandler: ReadPhaseQueryHandler;
    updatePhaseCommandHandler: UpdatePhaseCommandHandler;
    deletePhaseCommandHandler: DeletePhaseCommandHandler;
    generateGroupsPhaseMatchesCommandHandler: GenerateGroupsPhaseMatchesCommandHandler;

    groupRepository: GroupRepository;
    groupReadRepository: GroupReadRepository;
    getGroupsQueryHandler: GetGroupsQueryHandler;
    getTournamentGroupsQueryHandler: GetTournamentGroupsQueryHandler;
    createGroupCommandHandler: CreateGroupCommandHandler;
    readGroupQueryHandler: ReadGroupQueryHandler;
    updateGroupCommandHandler: UpdateGroupCommandHandler;
    deleteGroupCommandHandler: DeleteGroupCommandHandler;

    matchRepository: MatchRepository;
    matchReadRepository: MatchRepository;
    getMatchsQueryHandler: GetMatchsQueryHandler;
    getTournamentMatchesQueryHandler: GetTournamentMatchesQueryHandler;
    createMatchCommandHandler: CreateMatchCommandHandler;
    readMatchQueryHandler: ReadMatchQueryHandler;
    updateMatchCommandHandler: UpdateMatchCommandHandler;
    deleteMatchCommandHandler: DeleteMatchCommandHandler;

    userRepository: UserRepository;
    refreshTokenRepository: RefreshTokenRepository;
    emailVerificationTokenRepository: EmailVerificationTokenRepository;
    registrationInteractor: RegistrationInteractor;
    verifyEmailInteractor: VerifyEmailInteractor;
    loginInteractor: LoginInteractor;
    refreshInteractor: RefreshInteractor;
    logoutInteractor: LogoutInteractor;
    resendVerificationInteractor: ResendVerificationInteractor;
    sendVerificationEmailOnUserRegisteredSubscriber: SendVerificationEmailOnUserRegisteredSubscriber;

    tournamentOwnershipService: TournamentOwnershipService;
    tournamentReadOwnershipService: TournamentOwnershipService;

    commandBus: CommandBus;
    queryBus: QueryBus;

    models: Db;
    readModels: Db;
    logger: typeof logger;
    eventBus: EventBus;
    emailSender: EmailSender;
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
}

// Container creation
const container: AwilixContainer<Cradle> = createContainer<Cradle>();

// Register
container.register({
    playerRepository: asClass(SequelizePlayerRepository).scoped(),
    playerReadRepository: asClass(SequelizePlayerRepository).scoped().inject(() => ({ models: readModels })),
    getPlayersQueryHandler: asClass(GetPlayersQueryHandler).scoped(),
    createPlayerCommandHandler: asClass(CreatePlayerCommandHandler).scoped(),
    readPlayerQueryHandler: asClass(ReadPlayerQueryHandler).scoped(),
    updatePlayerCommandHandler: asClass(UpdatePlayerCommandHandler).scoped(),
    deletePlayerCommandHandler: asClass(DeletePlayerCommandHandler).scoped(),

    tournamentRepository: asClass(SequelizeTournamentRepository).scoped(),
    tournamentReadRepository: asClass(SequelizeTournamentRepository).scoped().inject(() => ({ models: readModels })),
    getTournamentsQueryHandler: asClass(GetTournamentsQueryHandler).scoped(),
    createTournamentCommandHandler: asClass(CreateTournamentCommandHandler).scoped(),
    readTournamentQueryHandler: asClass(ReadTournamentQueryHandler).scoped(),
    updateTournamentCommandHandler: asClass(UpdateTournamentCommandHandler).scoped(),
    deleteTournamentCommandHandler: asClass(DeleteTournamentCommandHandler).scoped(),

    phaseRepository: asClass(SequelizePhaseRepository).scoped(),
    phaseReadRepository: asClass(SequelizePhaseRepository).scoped().inject(() => ({ models: readModels })),
    getPhasesQueryHandler: asClass(GetPhasesQueryHandler).scoped(),
    createPhaseCommandHandler: asClass(CreatePhaseCommandHandler).scoped(),
    readPhaseQueryHandler: asClass(ReadPhaseQueryHandler).scoped(),
    updatePhaseCommandHandler: asClass(UpdatePhaseCommandHandler).scoped(),
    deletePhaseCommandHandler: asClass(DeletePhaseCommandHandler).scoped(),
    generateGroupsPhaseMatchesCommandHandler: asClass(GenerateGroupsPhaseMatchesCommandHandler).scoped(),

    groupRepository: asClass(SequelizeGroupRepository).scoped(),
    groupReadRepository: asClass(SequelizeGroupRepository).scoped().inject(() => ({ models: readModels })),
    getGroupsQueryHandler: asClass(GetGroupsQueryHandler).scoped(),
    getTournamentGroupsQueryHandler: asClass(GetTournamentGroupsQueryHandler).scoped(),
    createGroupCommandHandler: asClass(CreateGroupCommandHandler).scoped(),
    readGroupQueryHandler: asClass(ReadGroupQueryHandler).scoped(),
    updateGroupCommandHandler: asClass(UpdateGroupCommandHandler).scoped(),
    deleteGroupCommandHandler: asClass(DeleteGroupCommandHandler).scoped(),

    matchRepository: asClass(SequelizeMatchRepository).scoped(),
    matchReadRepository: asClass(SequelizeMatchRepository).scoped().inject(() => ({ models: readModels })),
    getMatchsQueryHandler: asClass(GetMatchsQueryHandler).scoped(),
    getTournamentMatchesQueryHandler: asClass(GetTournamentMatchesQueryHandler).scoped(),
    createMatchCommandHandler: asClass(CreateMatchCommandHandler).scoped(),
    readMatchQueryHandler: asClass(ReadMatchQueryHandler).scoped(),
    updateMatchCommandHandler: asClass(UpdateMatchCommandHandler).scoped(),
    deleteMatchCommandHandler: asClass(DeleteMatchCommandHandler).scoped(),

    userRepository: asClass(SequelizeUserRepository).scoped(),
    refreshTokenRepository: asClass(SequelizeRefreshTokenRepository).scoped(),
    emailVerificationTokenRepository: asClass(SequelizeEmailVerificationTokenRepository).scoped(),
    registrationInteractor: asClass(RegistrationInteractor).scoped(),
    verifyEmailInteractor: asClass(VerifyEmailInteractor).scoped(),
    loginInteractor: asClass(LoginInteractor).scoped(),
    refreshInteractor: asClass(RefreshInteractor).scoped(),
    logoutInteractor: asClass(LogoutInteractor).scoped(),
    resendVerificationInteractor: asClass(ResendVerificationInteractor).scoped(),

    // Depends on the four scoped repositories above, so it's scoped too — a
    // singleton would pin it to whichever request's repository instances resolved it first.
    tournamentOwnershipService: asClass(TournamentOwnershipService).scoped(),

    // Same service, wired to the four read repositories instead — used by query handlers
    // so an ownership check made while reading never falls back to the write connection.
    tournamentReadOwnershipService: asClass(TournamentOwnershipService).scoped().inject(() => ({
        tournamentRepository: container.cradle.tournamentReadRepository,
        groupRepository: container.cradle.groupReadRepository,
        phaseRepository: container.cradle.phaseReadRepository,
        matchRepository: container.cradle.matchReadRepository,
    })),

    // Controllers resolve these instead of individual handler tokens, so a handler
    // can be added/renamed/split without touching every controller that dispatches it.
    commandBus: asClass(CommandBus).scoped(),
    queryBus: asClass(QueryBus).scoped(),

    models: asValue(models),
    readModels: asValue(readModels),
    logger: asValue(logger),

    // In-memory now; swapped for a durable broker behind the same EventBus interface later.
    // Singleton so a subscription registered once at startup keeps receiving events
    // published from any request — a per-request (.scoped()) instance would lose them.
    eventBus: asClass(InMemoryEventBus).singleton(),

    // Console-only stand-in for a real mail provider — logs instead of sending.
    emailSender: asClass(ConsoleEmailSender).singleton(),

    // Subscribes to UserRegistered exactly once at startup (app.ts calls .subscribe()
    // on this instance) — singleton so that one subscription is the only one ever
    // registered on the shared eventBus.
    sendVerificationEmailOnUserRegisteredSubscriber: asClass(SendVerificationEmailOnUserRegisteredSubscriber).singleton(),

    // Stateless crypto utilities — no per-request data, so singleton avoids
    // re-reading env vars and re-instantiating bcrypt/jwt config on every request.
    passwordHasher: asClass(PasswordHasher).singleton(),
    tokenService: asClass(TokenService).singleton()
});

export default container;

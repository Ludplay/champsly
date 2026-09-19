import GetPlayersQueryHandler from '../queries/handlers/get-players.query-handler';
import ReadPlayerQueryHandler from '../queries/handlers/read-player.query-handler';

import GetTournamentsQueryHandler from '../queries/handlers/get-tournaments.query-handler';
import ReadTournamentQueryHandler from '../queries/handlers/read-tournament.query-handler';

import GetPhasesQueryHandler from '../queries/handlers/get-phases.query-handler';
import ReadPhaseQueryHandler from '../queries/handlers/read-phase.query-handler';

import GetGroupsQueryHandler from '../queries/handlers/get-groups.query-handler';
import GetTournamentGroupsQueryHandler from '../queries/handlers/get-tournament-groups.query-handler';
import ReadGroupQueryHandler from '../queries/handlers/read-group.query-handler';

import GetMatchsQueryHandler from '../queries/handlers/get-matchs.query-handler';
import GetTournamentMatchesQueryHandler from '../queries/handlers/get-tournament-matches.query-handler';
import ReadMatchQueryHandler from '../queries/handlers/read-match.query-handler';

import { GetPlayersQuery } from '../queries/get-players.query';
import { ReadPlayerQuery } from '../queries/read-player.query';

import { GetTournamentsQuery } from '../queries/get-tournaments.query';
import { ReadTournamentQuery } from '../queries/read-tournament.query';

import { GetPhasesQuery } from '../queries/get-phases.query';
import { ReadPhaseQuery } from '../queries/read-phase.query';

import { GetGroupsQuery } from '../queries/get-groups.query';
import { GetTournamentGroupsQuery } from '../queries/get-tournament-groups.query';
import { ReadGroupQuery } from '../queries/read-group.query';

import { GetMatchsQuery } from '../queries/get-matchs.query';
import { GetTournamentMatchesQuery } from '../queries/get-tournament-matches.query';
import { ReadMatchQuery } from '../queries/read-match.query';

type Query =
    | InstanceType<typeof GetPlayersQuery>
    | InstanceType<typeof ReadPlayerQuery>
    | InstanceType<typeof GetTournamentsQuery>
    | InstanceType<typeof ReadTournamentQuery>
    | InstanceType<typeof GetPhasesQuery>
    | InstanceType<typeof ReadPhaseQuery>
    | InstanceType<typeof GetGroupsQuery>
    | InstanceType<typeof GetTournamentGroupsQuery>
    | InstanceType<typeof ReadGroupQuery>
    | InstanceType<typeof GetMatchsQuery>
    | InstanceType<typeof GetTournamentMatchesQuery>
    | InstanceType<typeof ReadMatchQuery>;

interface QueryHandler<TResult = unknown> {
    execute(query: Query): Promise<TResult>;
}

class QueryBus {
    private handlers = new Map<Function, QueryHandler>();

    constructor(params: {
        getPlayersQueryHandler: GetPlayersQueryHandler;
        readPlayerQueryHandler: ReadPlayerQueryHandler;

        getTournamentsQueryHandler: GetTournamentsQueryHandler;
        readTournamentQueryHandler: ReadTournamentQueryHandler;

        getPhasesQueryHandler: GetPhasesQueryHandler;
        readPhaseQueryHandler: ReadPhaseQueryHandler;

        getGroupsQueryHandler: GetGroupsQueryHandler;
        getTournamentGroupsQueryHandler: GetTournamentGroupsQueryHandler;
        readGroupQueryHandler: ReadGroupQueryHandler;

        getMatchsQueryHandler: GetMatchsQueryHandler;
        getTournamentMatchesQueryHandler: GetTournamentMatchesQueryHandler;
        readMatchQueryHandler: ReadMatchQueryHandler;
    }) {
        this.handlers.set(GetPlayersQuery, params.getPlayersQueryHandler);
        this.handlers.set(ReadPlayerQuery, params.readPlayerQueryHandler);

        this.handlers.set(GetTournamentsQuery, params.getTournamentsQueryHandler);
        this.handlers.set(ReadTournamentQuery, params.readTournamentQueryHandler);

        this.handlers.set(GetPhasesQuery, params.getPhasesQueryHandler);
        this.handlers.set(ReadPhaseQuery, params.readPhaseQueryHandler);

        this.handlers.set(GetGroupsQuery, params.getGroupsQueryHandler);
        this.handlers.set(GetTournamentGroupsQuery, params.getTournamentGroupsQueryHandler);
        this.handlers.set(ReadGroupQuery, params.readGroupQueryHandler);

        this.handlers.set(GetMatchsQuery, params.getMatchsQueryHandler);
        this.handlers.set(GetTournamentMatchesQuery, params.getTournamentMatchesQueryHandler);
        this.handlers.set(ReadMatchQuery, params.readMatchQueryHandler);
    }

    async execute<TResult = unknown>(query: Query): Promise<TResult> {
        const handler = this.handlers.get(query.constructor);

        if (!handler) {
            throw new Error(`No query handler registered for query: ${query.constructor.name}`);
        }

        return handler.execute(query) as Promise<TResult>;
    }
}

export = QueryBus;

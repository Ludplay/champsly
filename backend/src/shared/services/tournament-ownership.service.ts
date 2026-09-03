import type { TournamentRepository } from '../repositories/tournament.types';
import type { GroupRepository } from '../repositories/group.types';
import type { PhaseRepository } from '../repositories/phase.types';
import type { MatchRepository } from '../repositories/match.types';
import { Tournament } from '../../infra/db/models/tournament';
import { Group } from '../../infra/db/models/group';
import { Phase } from '../../infra/db/models/phase';
import { Match } from '../../infra/db/models/match';
import { NotFoundError, ForbiddenError } from '../errors';

/**
 * Groups/Phases/Matches have no owner column of their own — they're authorized
 * transitively through their parent tournament's user_id (3.9).
 */
class TournamentOwnershipService {
    private tournamentRepository: TournamentRepository;
    private groupRepository: GroupRepository;
    private phaseRepository: PhaseRepository;
    private matchRepository: MatchRepository;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        groupRepository: GroupRepository;
        phaseRepository: PhaseRepository;
        matchRepository: MatchRepository;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.groupRepository = params.groupRepository;
        this.phaseRepository = params.phaseRepository;
        this.matchRepository = params.matchRepository;
    }

    async getTournamentOwner(tournamentId: number, userId: number): Promise<Tournament> {
        const tournament = await this.tournamentRepository.getOne(tournamentId);

        if (!tournament) {
            throw new NotFoundError('Tournament not found');
        }

        if (tournament.user_id !== userId) {
            throw new ForbiddenError('You do not have access to this tournament');
        }

        return tournament;
    }

    async getGroupOwner(groupId: number, userId: number): Promise<Group> {
        const group = await this.groupRepository.getOne(groupId);

        if (!group) {
            throw new NotFoundError('Group not found');
        }

        await this.getTournamentOwner(group.tournament_id, userId);

        return group;
    }

    async getPhaseOwner(phaseId: number, userId: number): Promise<Phase> {
        const phase = await this.phaseRepository.getOne(phaseId);

        if (!phase) {
            throw new NotFoundError('Phase not found');
        }

        await this.getTournamentOwner(phase.tournament_id, userId);

        return phase;
    }

    async getMatchOwner(matchId: number, userId: number): Promise<Match> {
        const match = await this.matchRepository.getOne(matchId);

        if (!match) {
            throw new NotFoundError('Match not found');
        }

        await this.getPhaseOwner(match.phase_id, userId);

        return match;
    }
}

export = TournamentOwnershipService;
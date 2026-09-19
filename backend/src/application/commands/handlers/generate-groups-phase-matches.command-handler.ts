import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type { MatchRepository } from '../../../shared/repositories/match.types';
import logger from '../../../infra/config/logger';
import { CreationAttributes, InferAttributes } from 'sequelize';
import { Match } from '../../../infra/db/models/match';
import type { Player } from '../../../infra/db/models/player';
import { MatchStatus } from '../../../shared/value-objects';
import type { GroupRepository } from '../../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { GenerateGroupsPhaseMatchesCommand } from '../generate-groups-phase-matches.command';

interface RoundRobinPlayer {
    id: number | null;
    name: string;
}

class GenerateGroupsPhaseMatchesCommandHandler {
    private phaseRepository: PhaseRepository;
    private matchRepository: MatchRepository;
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;
    private logger: typeof logger;

    constructor(params: {
        phaseRepository: PhaseRepository;
        matchRepository: MatchRepository;
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
        logger: typeof logger;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.matchRepository = params.matchRepository;
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
        this.logger = params.logger;
    }

    async execute(command: GenerateGroupsPhaseMatchesCommand) {
        // Kept outside the try/catch below, which swallows errors as return values
        // instead of rejecting — an ownership failure needs to actually propagate.
        await this.tournamentOwnershipService.getTournamentOwner(command.tournamentId, command.userId);

        try {
            const groupsPhaseId = await this.getGroupsPhaseId(command.tournamentId);

            if (!groupsPhaseId) {
                throw new Error('phaseId not identified');
            }

            const anyPhaseMatch = await this.phaseMatchesExist(groupsPhaseId);

            if (anyPhaseMatch) {
                this.logger.info({ phaseId: groupsPhaseId }, 'Matches already created');
                return anyPhaseMatch;
            }

            await this.createMatchesPhaseGroups(groupsPhaseId);

        } catch (error) {
            this.logger.error({ err: error }, 'Error executing generate groups phase matches');
            return error;
        }
    }

    async getGroupsPhaseId(tournamentId: number) {
        const phase = await this.phaseRepository.getTournamentGroupsPhase(tournamentId);

        if (!phase) {
            return null;
        }

        return phase.id;
    }

    async phaseMatchesExist(phaseId: number) {
        return await this.matchRepository.phaseMatchesExist(phaseId);
    }

    async createMatchesPhaseGroups(phaseId: number) {
        const phaseData = await this.phaseRepository.getOne(phaseId);
        if (!phaseData) {
            throw new Error(`Phase ${phaseId} not found`);
        }

        const tournamentId = phaseData.tournament_id;
        const groups = await this.groupRepository.getTournamentGroups(tournamentId);

        const allMatches: CreationAttributes<Match>[] = [];
        for (const group of groups) {
            const players = group.Players || [];

            this.logger.debug({ groupId: group.id }, 'Processing group');

            const groupMatches = await this.implementRoundRobinGroup(group.id, players, phaseId);
            allMatches.push(...groupMatches);
        }

        //console.log('allMatches', allMatches);
        await this.createMatches(allMatches);

    }

    async implementRoundRobinGroup(groupId: number, groupPlayers: InferAttributes<Player>[], phaseId: number) {
        if (!Array.isArray(groupPlayers) || groupPlayers.length < 2) {
            return [];
        }

        let players: RoundRobinPlayer[] = [...groupPlayers];

        let rounds;
        if (players.length % 2 === 0) {
            rounds = players.length - 1;
        } else {
            rounds = players.length;

            //For an odd number of players, it's necessary to add a "ghost player"
            //Whoever faces this ghost player, will not play in the round (bye)
            players.push({
                id: null,
                name: 'BYE'
            });
        }

        const matches: CreationAttributes<Match>[] = [];

        //For each round
        for (let round = 1; round <= rounds; round++) {
            let left = 0;
            let right = players.length - 1;

            this.logger.debug({ round }, 'Processing round');

            //Gets the players from each end of the array (1 x 10, 2 x 9...)
            while (left < right) {
                if (players[left].id !== null && players[right].id !== null) {
                    const matchInput = {
                        player1_id: players[left].id as number,
                        player2_id: players[right].id as number,
                        phase_id: phaseId,
                        group_id: groupId,
                        round_number: round,
                        status: MatchStatus.Waiting
                    }
                    matches.push(matchInput);
                    this.logger.debug({ player1: players[left].name, player2: players[right].name }, 'Match created');
                } else {
                    const playerInBye = players[left].id !== null ? players[left].name : players[right].name;
                    this.logger.debug({ player: playerInBye }, 'Player is out this round');
                }

                left++;
                right--;
            }

            //Removes array's last player
            const lastPlayerRemoved = players.pop() as RoundRobinPlayer;

            //Adds the player removed into the array after first position (rotates players except the first one)
            players.splice(1, 0, lastPlayerRemoved);
        }

        return matches;
    }

    async createMatches(data: CreationAttributes<Match>[]) {
        return await this.matchRepository.createMany(data);
    }

}

export = GenerateGroupsPhaseMatchesCommandHandler;

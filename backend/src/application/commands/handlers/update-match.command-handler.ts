import type { MatchRepository } from '../../../shared/repositories/match.types';
import type { EventBus } from '../../../shared/events/event-bus.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import { Score } from '../../../shared/value-objects';
import { MatchResultRecorded } from '../../../shared/events';
import type { UpdateMatchCommand } from '../update-match.command';

class UpdateMatchCommandHandler {
    private matchRepository: MatchRepository;
    private eventBus: EventBus;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        eventBus: EventBus;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.eventBus = params.eventBus;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    // getMatchOwner throws NotFoundError('Match not found') itself when the id doesn't
    // exist, before it even checks ownership — the same error the plain-update path
    // used to get one call later, from matchRepository.update().
    async execute(command: UpdateMatchCommand) {
        const match = await this.tournamentOwnershipService.getMatchOwner(command.id, command.userId);
        let changes = command.changes;
        const isRecordingResult = changes.player1_score !== undefined && changes.player2_score !== undefined;

        if (isRecordingResult) {
            match.recordResult(new Score(changes.player1_score as number, changes.player2_score as number));

            changes = {
                ...changes,
                status: match.status,
                winner_player_id: match.winner_player_id
            };
        }

        const updatedMatch = await this.matchRepository.update(command.id, changes);

        if (isRecordingResult) {
            await this.eventBus.publish(new MatchResultRecorded(
                updatedMatch.id,
                updatedMatch.player1_score,
                updatedMatch.player2_score,
                updatedMatch.winner_player_id
            ));
        }

        return updatedMatch;
    }

}

export = UpdateMatchCommandHandler;

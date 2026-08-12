import { CreationAttributes } from 'sequelize';
import type { MatchRepository } from '../../shared/repositories/match.types';
import type { EventBus } from '../../shared/events/event-bus.types';
import { Match } from '../../infra/db/models/match';
import { Score } from '../../shared/value-objects';
import { NotFoundError } from '../../shared/errors';
import { MatchResultRecorded } from '../../shared/events';

class UpdateMatchInteractor {
    private matchRepository: MatchRepository;
    private eventBus: EventBus;

    constructor(params: { matchRepository: MatchRepository; eventBus: EventBus }) {
        this.matchRepository = params.matchRepository;
        this.eventBus = params.eventBus;
    }

    async execute(id: number, input: Partial<CreationAttributes<Match>>) {
        const isRecordingResult = input.player1_score !== undefined && input.player2_score !== undefined;

        if (isRecordingResult) {
            const match = await this.matchRepository.getOne(id);
            if (!match) {
                throw new NotFoundError('Match not found');
            }

            match.recordResult(new Score(input.player1_score as number, input.player2_score as number));

            input = {
                ...input,
                status: match.status,
                winner_player_id: match.winner_player_id
            };
        }

        const updatedMatch = await this.matchRepository.update(id, input);

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

export = UpdateMatchInteractor;

import { CreationAttributes } from 'sequelize';
import type { EventSubscriber } from '../../../shared/events/event-bus.types';
import type { GroupRepository } from '../../../shared/repositories/group.types';
import type { GroupStandingsRepository } from '../../../shared/repositories/group-standings.types';
import type { ProcessedEventRepository } from '../../../shared/repositories/processed-event.types';
import type { TransactionManager, RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import { GroupStanding } from '../../db/models/group-standing';
import { GroupStandingsUpdated } from '../../../shared/events';

class GroupStandingsProjectionConsumer implements EventSubscriber<GroupStandingsUpdated> {
    static readonly consumerGroup = 'group-standings-projection';

    private groupRepository: GroupRepository;
    private groupStandingsRepository: GroupStandingsRepository;
    private processedEventRepository: ProcessedEventRepository;
    private transactionManager: TransactionManager;

    constructor(params: {
        groupRepository: GroupRepository;
        groupStandingsRepository: GroupStandingsRepository;
        processedEventRepository: ProcessedEventRepository;
        transactionManager: TransactionManager;
    }) {
        this.groupRepository = params.groupRepository;
        this.groupStandingsRepository = params.groupStandingsRepository;
        this.processedEventRepository = params.processedEventRepository;
        this.transactionManager = params.transactionManager;
    }

    async handle(event: GroupStandingsUpdated): Promise<void> {
        const groupId = Number(event.aggregateId);
        const group = await this.groupRepository.getOne(groupId);

        // A snapshot can outlive its group; inserting it would only fail the foreign key forever.
        if (!group) {
            return;
        }

        const rows: CreationAttributes<GroupStanding>[] = event.standings.map((standing) => ({
            group_id: groupId,
            player_id: standing.playerId,
            wins: standing.wins,
            points: standing.points,
            matches_played: standing.matchesPlayed
        }));

        await this.transactionManager.run(async (transaction) => {
            const transactionOptions: RequiredTransactionOptions = { transaction };
            const isFirstDelivery = await this.processedEventRepository.markProcessed(GroupStandingsProjectionConsumer.consumerGroup, event.eventId, transactionOptions);

            if (!isFirstDelivery) {
                return;
            }

            await this.groupStandingsRepository.replaceForGroup(groupId, rows, transactionOptions);
        });
    }
}

export = GroupStandingsProjectionConsumer;

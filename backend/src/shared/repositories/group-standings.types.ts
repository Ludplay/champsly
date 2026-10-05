import { CreationAttributes, InferAttributes } from 'sequelize';
import { GroupStanding } from '../../infra/db/models/group-standing';
import type { RequiredTransactionOptions } from '../persistence/transaction-manager.types';

export type GroupStandingRecord = InferAttributes<GroupStanding>;

export interface GroupStandingsRepository {
    // Deletes and re-inserts the group's rows; the caller's transaction keeps readers from seeing a half-written snapshot.
    replaceForGroup(groupId: number, standings: CreationAttributes<GroupStanding>[], options: RequiredTransactionOptions): Promise<void>;
}

export interface GroupStandingsReadRepository {
    getByGroupIds(groupIds: number[]): Promise<GroupStandingRecord[]>;
}

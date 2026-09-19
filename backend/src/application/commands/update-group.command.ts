import type { CreationAttributes } from 'sequelize';
import type { Group } from '../../infra/db/models/group';

export class UpdateGroupCommand {
    readonly id: number;
    readonly changes: Partial<CreationAttributes<Group>>;
    readonly userId: number;

    constructor(params: { id: number; changes: Partial<CreationAttributes<Group>>; userId: number }) {
        this.id = params.id;
        this.changes = params.changes;
        this.userId = params.userId;
    }
}

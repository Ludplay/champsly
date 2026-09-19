import type { CreationAttributes } from 'sequelize';
import type { Phase } from '../../infra/db/models/phase';

export class UpdatePhaseCommand {
    readonly id: number;
    readonly changes: Partial<CreationAttributes<Phase>>;
    readonly userId: number;

    constructor(params: { id: number; changes: Partial<CreationAttributes<Phase>>; userId: number }) {
        this.id = params.id;
        this.changes = params.changes;
        this.userId = params.userId;
    }
}

import type { CreationAttributes } from 'sequelize';
import type { Match } from '../../infra/db/models/match';

export class UpdateMatchCommand {
    readonly id: number;
    readonly changes: Partial<CreationAttributes<Match>>;
    readonly userId: number;

    constructor(params: { id: number; changes: Partial<CreationAttributes<Match>>; userId: number }) {
        this.id = params.id;
        this.changes = params.changes;
        this.userId = params.userId;
    }
}

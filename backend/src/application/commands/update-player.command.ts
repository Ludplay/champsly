import type { CreationAttributes } from 'sequelize';
import type { Player } from '../../infra/db/models/player';

export class UpdatePlayerCommand {
    readonly id: number;
    readonly changes: Partial<CreationAttributes<Player>>;
    readonly userId: number;

    constructor(params: { id: number; changes: Partial<CreationAttributes<Player>>; userId: number }) {
        this.id = params.id;
        this.changes = params.changes;
        this.userId = params.userId;
    }
}

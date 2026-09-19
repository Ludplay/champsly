import type { CreationAttributes } from 'sequelize';
import type { Player } from '../../infra/db/models/player';

export class UpdatePlayerCommand {
    readonly id: number;
    readonly changes: Partial<CreationAttributes<Player>>;

    constructor(params: { id: number; changes: Partial<CreationAttributes<Player>> }) {
        this.id = params.id;
        this.changes = params.changes;
    }
}

import type { CreationAttributes } from 'sequelize';
import type { Player } from '../../infra/db/models/player';

export class CreatePlayerCommand {
    readonly name: Pick<CreationAttributes<Player>, 'name'>['name'];
    readonly userId: number;

    constructor(params: Pick<CreationAttributes<Player>, 'name'> & { userId: number }) {
        this.name = params.name;
        this.userId = params.userId;
    }
}

import type { CreationAttributes } from 'sequelize';
import type { Player } from '../../infra/db/models/player';

export class CreatePlayerCommand {
    readonly name: Pick<CreationAttributes<Player>, 'name'>['name'];

    constructor(params: Pick<CreationAttributes<Player>, 'name'>) {
        this.name = params.name;
    }
}

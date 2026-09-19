import type { CreationAttributes } from 'sequelize';
import type { Group } from '../../infra/db/models/group';

type CreateGroupFields = Pick<CreationAttributes<Group>, 'tournament_id' | 'name' | 'number'>;

export class CreateGroupCommand {
    readonly tournament_id: CreateGroupFields['tournament_id'];
    readonly name: CreateGroupFields['name'];
    readonly number: CreateGroupFields['number'];
    readonly userId: number;

    constructor(params: CreateGroupFields & { userId: number }) {
        this.tournament_id = params.tournament_id;
        this.name = params.name;
        this.number = params.number;
        this.userId = params.userId;
    }
}

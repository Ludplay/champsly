import type { CreationAttributes } from 'sequelize';
import type { Phase } from '../../infra/db/models/phase';

type CreatePhaseFields = Pick<CreationAttributes<Phase>, 'tournament_id' | 'name' | 'status' | 'number'>;

export class CreatePhaseCommand {
    readonly tournament_id: CreatePhaseFields['tournament_id'];
    readonly name: CreatePhaseFields['name'];
    readonly status: CreatePhaseFields['status'];
    readonly number: CreatePhaseFields['number'];
    readonly userId: number;

    constructor(params: CreatePhaseFields & { userId: number }) {
        this.tournament_id = params.tournament_id;
        this.name = params.name;
        this.status = params.status;
        this.number = params.number;
        this.userId = params.userId;
    }
}

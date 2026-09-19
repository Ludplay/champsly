import type { CreationAttributes } from 'sequelize';
import type { Tournament } from '../../infra/db/models/tournament';

export class UpdateTournamentCommand {
    readonly id: number;
    readonly changes: Partial<CreationAttributes<Tournament>>;
    readonly userId: number;

    constructor(params: { id: number; changes: Partial<CreationAttributes<Tournament>>; userId: number }) {
        this.id = params.id;
        this.changes = params.changes;
        this.userId = params.userId;
    }
}

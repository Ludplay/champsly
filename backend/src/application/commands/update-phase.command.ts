import type { CreationAttributes } from 'sequelize';
import type { Phase } from '../../infra/db/models/phase';

type UpdatePhaseChanges = Partial<Omit<CreationAttributes<Phase>, 'status'>> & { status?: string };

export class UpdatePhaseCommand {
    readonly id: number;
    readonly changes: UpdatePhaseChanges;
    readonly userId: number;

    constructor(params: { id: number; changes: UpdatePhaseChanges; userId: number }) {
        this.id = params.id;
        this.changes = params.changes;
        this.userId = params.userId;
    }
}

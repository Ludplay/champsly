import type { CreationAttributes } from 'sequelize';
import type { Match } from '../../infra/db/models/match';

type CreateMatchFields = Pick<CreationAttributes<Match>, 'phase_id' | 'group_id' | 'round_number' | 'player1_id' | 'player2_id'> & { status: string };

export class CreateMatchCommand {
    readonly phase_id: CreateMatchFields['phase_id'];
    readonly group_id: CreateMatchFields['group_id'];
    readonly round_number: CreateMatchFields['round_number'];
    readonly player1_id: CreateMatchFields['player1_id'];
    readonly player2_id: CreateMatchFields['player2_id'];
    readonly status: CreateMatchFields['status'];
    readonly userId: number;

    constructor(params: CreateMatchFields & { userId: number }) {
        this.phase_id = params.phase_id;
        this.group_id = params.group_id;
        this.round_number = params.round_number;
        this.player1_id = params.player1_id;
        this.player2_id = params.player2_id;
        this.status = params.status;
        this.userId = params.userId;
    }
}

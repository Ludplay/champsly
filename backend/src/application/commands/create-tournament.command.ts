interface TournamentPlayerInput {
    player_id: number;
}

export class CreateTournamentCommand {
    readonly name: string;
    readonly groups_quantity: number;
    readonly phases_quantity: number;
    readonly status: string;
    readonly players: TournamentPlayerInput[];
    readonly userId: number;

    constructor(params: {
        name: string;
        groups_quantity: number;
        phases_quantity: number;
        status: string;
        players: TournamentPlayerInput[];
        userId: number;
    }) {
        this.name = params.name;
        this.groups_quantity = params.groups_quantity;
        this.phases_quantity = params.phases_quantity;
        this.status = params.status;
        this.players = params.players;
        this.userId = params.userId;
    }
}

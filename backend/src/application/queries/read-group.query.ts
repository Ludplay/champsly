export class ReadGroupQuery {
    readonly id: number;
    readonly userId: number;

    constructor(params: { id: number; userId: number }) {
        this.id = params.id;
        this.userId = params.userId;
    }
}

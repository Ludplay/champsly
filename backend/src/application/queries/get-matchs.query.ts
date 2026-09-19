export class GetMatchsQuery {
    readonly userId: number;

    constructor(params: { userId: number }) {
        this.userId = params.userId;
    }
}

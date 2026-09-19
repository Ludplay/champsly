export class GetGroupsQuery {
    readonly userId: number;

    constructor(params: { userId: number }) {
        this.userId = params.userId;
    }
}

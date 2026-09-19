export class ReadPlayerQuery {
    readonly id: number;

    constructor(params: { id: number }) {
        this.id = params.id;
    }
}

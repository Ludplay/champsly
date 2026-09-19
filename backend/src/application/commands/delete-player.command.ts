export class DeletePlayerCommand {
    readonly id: number;

    constructor(params: { id: number }) {
        this.id = params.id;
    }
}


class GetPlayersInteractor {

    constructor(params) {
        this.playerRepository = params.playerRepository;
    }

    async execute() {
        const all = await this.playerRepository.getAll();                
        return all;
    }

}

module.exports = GetPlayersInteractor;

class CreatePlayerInteractor {

    constructor(params) {
        this.playerRepository = params.playerRepository;
    }

    async execute(input) {

        const { name } = input;

        const inputRecord = {
            name
        };

        const response = await this.playerRepository.create(inputRecord);
        
        return response;
    }

}

module.exports = CreatePlayerInteractor;
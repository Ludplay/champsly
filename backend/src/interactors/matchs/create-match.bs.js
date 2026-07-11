
class CreateMatchInteractor {

    constructor(params) {
        this.matchRepository = params.matchRepository;
    }

    async execute(input) {
        const { phase_id, group_id, round_number, player1_id, player2_id, status } = input;

        const inputRecord = {
            phase_id,
            group_id,
            round_number,
            player1_id,
            player2_id,
            status,
            player1_score: 0,
            player2_score: 0
        };

        return await this.matchRepository.create(inputRecord);
    }

}

module.exports = CreateMatchInteractor;


class UpdateGroupInteractor {

    constructor(params) {
        this.groupRepository = params.groupRepository;
    }

    async execute(id, input) {
        return await this.groupRepository.update(id, input);
    }

}

module.exports = UpdateGroupInteractor;


class ReadGroupInteractor {

    constructor(params) {
        this.groupRepository = params.groupRepository;
    }

    async execute(id) {
        return await this.groupRepository.getOne(id);
    }

}

module.exports = ReadGroupInteractor;


class DeleteGroupInteractor {

    constructor(params) {
        this.groupRepository = params.groupRepository;
    }

    async execute(id) {
        return await this.groupRepository.delete(id);
    }

}

module.exports = DeleteGroupInteractor;

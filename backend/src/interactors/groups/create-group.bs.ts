import { CreationAttributes } from 'sequelize';
import type { GroupRepository } from '../../shared/repositories/group.types';
import { Group } from '../../infra/db/models/group';

class CreateGroupInteractor {
    private groupRepository: GroupRepository;

    constructor(params: { groupRepository: GroupRepository }) {
        this.groupRepository = params.groupRepository;
    }

    async execute(input: Pick<CreationAttributes<Group>, 'tournament_id' | 'name' | 'number'>) {
        const { tournament_id, name, number } = input;

        const inputRecord = {
            tournament_id,
            name,
            number
        };

        return await this.groupRepository.create(inputRecord);
    }

    async addPlayersInGroups(groupsIds: number[], playersIds: number[]) {

        //sort randomly
        const sortedPlayersIds = playersIds.sort(() => Math.random() - 0.5);

        let indexGroup = 0;
        for (let i=0; i < sortedPlayersIds.length; i++) {
            const groupId = groupsIds[indexGroup];
            const playerId = sortedPlayersIds[i];

            await this.groupRepository.addPlayerInGroup(playerId, groupId);

            indexGroup++;

            if (indexGroup === groupsIds.length) {
                indexGroup = 0;
            }
        }
    }

}

export = CreateGroupInteractor;

const Module = require("node:module");
const { NotFoundError } = require('../../shared/errors');

class GroupRepository {

    constructor(params) {
        this.groupModel = params.models.Group;
    }   
    
    async getAll() {
        const options = {
            include: [{
                model: this.groupModel.sequelize.models.Player,
                as: 'Players'
            }]
        };

        return await this.groupModel.findAll(options);
    } 
    
    async getTournamentGroups(tournamentId) {
        const options = {
            include: [{
                model: this.groupModel.sequelize.models.Player,
                as: 'Players'
            }],
            where: {
                tournament_id: tournamentId
            }
        };

        const groups = await this.groupModel.findAll(options);
        const groupIds = groups.map(group => group.id);

        if (!groupIds.length) {
            return groups;
        }

        const matches = await this.groupModel.sequelize.models.Match.findAll({
            where: {
                group_id: groupIds
            }
        });

        const statsByGroup = matches.reduce((acc, match) => {
            const groupStats = acc[match.group_id] || {};

            const ensurePlayer = (playerId) => {
                if (!groupStats[playerId]) {
                    groupStats[playerId] = { wins: 0, points: 0 };
                }
                return groupStats[playerId];
            };

            const player1Stats = ensurePlayer(match.player1_id);
            const player2Stats = ensurePlayer(match.player2_id);

            player1Stats.points += Number(match.player1_score) || 0;
            player2Stats.points += Number(match.player2_score) || 0;

            if (match.winner_player_id) {
                ensurePlayer(match.winner_player_id).wins += 1;
            }

            acc[match.group_id] = groupStats;
            return acc;
        }, {});

        return groups.map(group => {
            const groupStats = statsByGroup[group.id] || {};
            const playersWithStats = (group.Players || []).map(player => ({
                ...player.toJSON(),
                wins: groupStats[player.id]?.wins || 0,
                points: groupStats[player.id]?.points || 0
            }));

            const groupJson = group.toJSON();
            groupJson.Players = playersWithStats;
            return groupJson;
        });
    }

    async getOne(id) {
        const options = {
            include: [{
                model: this.groupModel.sequelize.models.Player,
                as: 'Players'
            }]
        };

        return await this.groupModel.findByPk(id, options);
    }

    async create(data) {
        return await this.groupModel.create(data);
    }

    async update(id, data) {
        const group = await this.groupModel.findByPk(id);
        if (group) {
            await group.update(data);
            return group;
        } else {
            throw new NotFoundError('Group not found');
        }
    }

    async delete(id) {
        return await this.groupModel.destroy({ where: { id } });
    }

    async addPlayerInGroup(playerId, groupId) {
        const sql = `INSERT INTO groups_players (player_id, group_id, created_at, updated_at) VALUES (:playerId, :groupId, now(), now())`;

        return await this.groupModel.sequelize.query(sql, {
            replacements: {
                playerId,
                groupId
            },
            type: this.groupModel.sequelize.QueryTypes.INSERT,
        });
    }
}

module.exports = GroupRepository;

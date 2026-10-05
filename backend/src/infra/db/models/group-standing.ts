import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

// Projection row written only by the group standings sink; never edited by request handlers.
export class GroupStanding extends Model<InferAttributes<GroupStanding>, InferCreationAttributes<GroupStanding>> {
    declare group_id: number;
    declare player_id: number;
    declare wins: number;
    declare points: number;
    declare matches_played: number;
    declare updated_at: CreationOptional<Date>;
}

export default function initGroupStandingModel(sequelize: Sequelize): typeof GroupStanding {
    GroupStanding.init({
        group_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        player_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        wins: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        matches_played: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'GroupStanding',
        tableName: 'group_standings',
        timestamps: true,
        createdAt: false,
        updatedAt: 'updated_at'
    });

    return GroupStanding;
}

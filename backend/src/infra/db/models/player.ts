import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import type { Db } from './models.types';
import type { Tournament } from './tournament';
import type { Group } from './group';

export class Player extends Model<InferAttributes<Player>, InferCreationAttributes<Player>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare extra: CreationOptional<string | null>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare Tournaments?: NonAttribute<Tournament[]>;
    declare Groups?: NonAttribute<Group[]>;

    static associate(models: Db) {
        Player.belongsToMany(models.Tournament, {
            through: 'tournaments_players',
            as: 'Tournaments',
            foreignKey: 'player_id',
            otherKey: 'tournament_id'
        });

        Player.belongsToMany(models.Group, {
            through: 'groups_players',
            as: 'Groups',
            foreignKey: 'player_id',
            otherKey: 'group_id'
        });
    }
}

export default function initPlayerModel(sequelize: Sequelize): typeof Player {
    Player.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        extra: {
            type: DataTypes.STRING
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Player',
        tableName: 'players',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Player;
}

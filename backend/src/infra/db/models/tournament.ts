import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute, BelongsToManyAddAssociationsMixin } from 'sequelize';
import type { Db } from './models.types';
import type { Player } from './player';
import { TournamentStatus } from '../../../shared/value-objects';

export class Tournament extends Model<InferAttributes<Tournament>, InferCreationAttributes<Tournament>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare groups_quantity: number;
    declare phases_quantity: number;
    declare status: TournamentStatus;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare Players?: NonAttribute<Player[]>;
    declare addPlayers: BelongsToManyAddAssociationsMixin<Player, number>;

    static associate(models: Db) {
        Tournament.belongsToMany(models.Player, {
            through: 'tournaments_players',
            as: 'Players',
            foreignKey: 'tournament_id',
            otherKey: 'player_id'
        });
    }

    canStart(): boolean {
        return this.status === TournamentStatus.Draft;
    }

    canFinish(): boolean {
        return this.status === TournamentStatus.Active;
    }
}

export default function initTournamentModel(sequelize: Sequelize): typeof Tournament {
    Tournament.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        groups_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        phases_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
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
        modelName: 'Tournament',
        tableName: 'tournaments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Tournament;
}

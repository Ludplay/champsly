import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import type { Db } from './models.types';
import type { Match } from './match';
import type { Tournament } from './tournament';

export class Phase extends Model<InferAttributes<Phase>, InferCreationAttributes<Phase>> {
    declare id: CreationOptional<number>;
    declare tournament_id: number;
    declare name: string;
    declare status: string;
    declare number: CreationOptional<number | null>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare Matches?: NonAttribute<Match[]>;
    declare Tournaments?: NonAttribute<Tournament>;

    static associate(models: Db) {
        Phase.hasMany(models.Match, {
            foreignKey: 'phase_id',
            as: 'Matches'
        });

        Phase.belongsTo(models.Tournament, {
            foreignKey: 'tournament_id',
            as: 'Tournaments'
        });
    }
}

export default function initPhaseModel(sequelize: Sequelize): typeof Phase {
    Phase.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tournament_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        modelName: 'Phase',
        tableName: 'phases',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Phase;
}

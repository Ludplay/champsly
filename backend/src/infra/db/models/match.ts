import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import type { Db } from './models.types';
import type { Phase } from './phase';
import type { Player } from './player';
import { MatchStatus, Score } from '../../../shared/value-objects';

export class Match extends Model<InferAttributes<Match>, InferCreationAttributes<Match>> {
    declare id: CreationOptional<number>;
    declare phase_id: number;
    declare group_id: CreationOptional<number | null>;
    declare round_number: number;
    declare player1_id: number;
    declare player2_id: number;
    declare status: MatchStatus;
    declare winner_player_id: CreationOptional<number | null>;
    declare player1_score: CreationOptional<number>;
    declare player2_score: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare Phase?: NonAttribute<Phase>;
    declare Player1?: NonAttribute<Player>;
    declare Player2?: NonAttribute<Player>;

    static associate(models: Db) {
        Match.belongsTo(models.Phase, {
            foreignKey: 'phase_id',
            as: 'Phase'
        });

        Match.belongsTo(models.Player, {
            foreignKey: 'player1_id',
            as: 'Player1'
        });

        Match.belongsTo(models.Player, {
            foreignKey: 'player2_id',
            as: 'Player2'
        });
    }

    recordResult(score: Score): void {
        this.player1_score = score.player1;
        this.player2_score = score.player2;

        const winner = score.winner();
        this.winner_player_id = winner === 'player1' ? this.player1_id : winner === 'player2' ? this.player2_id : null;
        this.status = MatchStatus.Finished;
    }
}

export default function initMatchModel(sequelize: Sequelize): typeof Match {
    Match.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        phase_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        round_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        player1_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        player2_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        winner_player_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        player1_score: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        player2_score: {
            type: DataTypes.INTEGER,
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
        modelName: 'Match',
        tableName: 'matches',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Match;
}

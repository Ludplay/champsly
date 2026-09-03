import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import type { Db } from './models.types';
import type { User } from './user';

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
    declare id: CreationOptional<number>;
    declare user_id: number;
    declare token_hash: string;
    declare expires_at: Date;
    declare revoked_at: CreationOptional<Date | null>;
    declare replaced_by_id: CreationOptional<number | null>;
    declare created_at: CreationOptional<Date>;
    declare User?: NonAttribute<User>;
    declare ReplacedBy?: NonAttribute<RefreshToken>;

    static associate(models: Db) {
        RefreshToken.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User'
        });

        RefreshToken.belongsTo(models.RefreshToken, {
            foreignKey: 'replaced_by_id',
            as: 'ReplacedBy'
        });
    }
}

export default function initRefreshTokenModel(sequelize: Sequelize): typeof RefreshToken {
    RefreshToken.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        token_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        replaced_by_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'RefreshToken',
        tableName: 'refresh_tokens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return RefreshToken;
}

import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import type { Db } from './models.types';
import type { Tournament } from './tournament';
import type { Player } from './player';
import type { RefreshToken } from './refresh-token';
import type { EmailVerificationToken } from './email-verification-token';
import { AccountStatus } from '../../../shared/value-objects';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare status: AccountStatus;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare Tournaments?: NonAttribute<Tournament[]>;
    declare Players?: NonAttribute<Player[]>;
    declare RefreshTokens?: NonAttribute<RefreshToken[]>;
    declare EmailVerificationTokens?: NonAttribute<EmailVerificationToken[]>;

    static associate(models: Db) {
        User.hasMany(models.Tournament, {
            foreignKey: 'user_id',
            as: 'Tournaments'
        });

        User.hasMany(models.Player, {
            foreignKey: 'user_id',
            as: 'Players'
        });

        User.hasMany(models.RefreshToken, {
            foreignKey: 'user_id',
            as: 'RefreshTokens'
        });

        User.hasMany(models.EmailVerificationToken, {
            foreignKey: 'user_id',
            as: 'EmailVerificationTokens'
        });
    }
}

export default function initUserModel(sequelize: Sequelize): typeof User {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: AccountStatus.PendingVerification
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
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return User;
}

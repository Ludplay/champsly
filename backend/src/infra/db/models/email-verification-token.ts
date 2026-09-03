import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import type { Db } from './models.types';
import type { User } from './user';

export class EmailVerificationToken extends Model<InferAttributes<EmailVerificationToken>, InferCreationAttributes<EmailVerificationToken>> {
    declare id: CreationOptional<number>;
    declare user_id: number;
    declare token_hash: string;
    declare expires_at: Date;
    declare used_at: CreationOptional<Date | null>;
    declare created_at: CreationOptional<Date>;
    declare User?: NonAttribute<User>;

    static associate(models: Db) {
        EmailVerificationToken.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User'
        });
    }
}

export default function initEmailVerificationTokenModel(sequelize: Sequelize): typeof EmailVerificationToken {
    EmailVerificationToken.init({
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
        used_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'EmailVerificationToken',
        tableName: 'email_verification_tokens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return EmailVerificationToken;
}

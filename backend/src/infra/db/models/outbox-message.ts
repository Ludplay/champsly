import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

// A domain event waiting to be relayed to Kafka; payload is the full envelope the relay sends.
export class OutboxMessage extends Model<InferAttributes<OutboxMessage>, InferCreationAttributes<OutboxMessage>> {
    declare id: string;
    declare topic: string;
    declare message_key: string;
    declare event_type: string;
    declare payload: object;
    declare occurred_on: Date;
    declare created_at: CreationOptional<Date>;
    declare published_at: CreationOptional<Date | null>;
    declare attempts: CreationOptional<number>;
    declare last_error: CreationOptional<string | null>;
}

export default function initOutboxMessageModel(sequelize: Sequelize): typeof OutboxMessage {
    OutboxMessage.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        topic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message_key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        payload: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        occurred_on: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // Filled by the database default (clock_timestamp()), never by the model.
        created_at: {
            type: DataTypes.DATE
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        last_error: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'OutboxMessage',
        tableName: 'outbox',
        timestamps: false
    });

    return OutboxMessage;
}

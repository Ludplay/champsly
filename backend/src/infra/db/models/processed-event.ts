import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

// One row per (consumer group, event) handled, written in the same transaction as the consumer's side effect.
export class ProcessedEvent extends Model<InferAttributes<ProcessedEvent>, InferCreationAttributes<ProcessedEvent>> {
    declare consumer_group: string;
    declare event_id: string;
    declare processed_at: CreationOptional<Date>;
}

export default function initProcessedEventModel(sequelize: Sequelize): typeof ProcessedEvent {
    ProcessedEvent.init({
        consumer_group: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        event_id: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        processed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'ProcessedEvent',
        tableName: 'processed_events',
        timestamps: false
    });

    return ProcessedEvent;
}

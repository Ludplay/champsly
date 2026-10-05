import { Sequelize } from 'sequelize';
import writeConfig from '../../config/config-sequelize';
import readConfig from '../../config/config-sequelize-read';
import initTournamentModel from './tournament';
import initPlayerModel from './player';
import initGroupModel from './group';
import initPhaseModel from './phase';
import initMatchModel from './match';
import initUserModel from './user';
import initRefreshTokenModel from './refresh-token';
import initEmailVerificationTokenModel from './email-verification-token';
import initGroupStandingModel from './group-standing';
import initOutboxMessageModel from './outbox-message';
import initProcessedEventModel from './processed-event';
import type { Db } from './models.types';

const env = process.env.NODE_ENV || 'development';
const dbConfig = writeConfig[env];

function buildSequelize(config: typeof dbConfig): Sequelize {
    return config.use_env_variable
        ? new Sequelize(process.env[config.use_env_variable] as string, config)
        : new Sequelize(config.database as string, config.username as string, config.password as string, config);
}

function buildDb(sequelize: Sequelize): Db {
    const db: Db = {
        Tournament: initTournamentModel(sequelize),
        Player: initPlayerModel(sequelize),
        Group: initGroupModel(sequelize),
        Phase: initPhaseModel(sequelize),
        Match: initMatchModel(sequelize),
        User: initUserModel(sequelize),
        RefreshToken: initRefreshTokenModel(sequelize),
        EmailVerificationToken: initEmailVerificationTokenModel(sequelize),
        GroupStanding: initGroupStandingModel(sequelize),
        OutboxMessage: initOutboxMessageModel(sequelize),
        ProcessedEvent: initProcessedEventModel(sequelize),
        sequelize,
        Sequelize,
    };

    [db.Tournament, db.Player, db.Group, db.Phase, db.Match, db.User, db.RefreshToken, db.EmailVerificationToken].forEach((model) => model.associate(db));

    return db;
}

const db = buildDb(buildSequelize(dbConfig));
const readDb = buildDb(buildSequelize(readConfig));

export = { db, readDb };

import { Sequelize } from 'sequelize';
import config from '../../config/config-sequelize';
import initTournamentModel from './tournament';
import initPlayerModel from './player';
import initGroupModel from './group';
import initPhaseModel from './phase';
import initMatchModel from './match';
import type { Db } from './models.types';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.use_env_variable
    ? new Sequelize(process.env[dbConfig.use_env_variable] as string, dbConfig)
    : new Sequelize(dbConfig.database as string, dbConfig.username as string, dbConfig.password as string, dbConfig);

const db: Db = {
    Tournament: initTournamentModel(sequelize),
    Player: initPlayerModel(sequelize),
    Group: initGroupModel(sequelize),
    Phase: initPhaseModel(sequelize),
    Match: initMatchModel(sequelize),
    sequelize,
    Sequelize,
};

[db.Tournament, db.Player, db.Group, db.Phase, db.Match].forEach((model) => model.associate(db));

export = db;

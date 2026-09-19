import { Dialect } from 'sequelize';
import { EnvConfig } from './config-sequelize.types';

require('dotenv').config({ quiet: true });

const readConfig: EnvConfig = {
    username: process.env.DB_READ_USERNAME || process.env.DB_USERNAME,
    password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_READ_HOST || process.env.DB_HOST,
    dialect: process.env.DB_DIALECT as Dialect,
    port: process.env.DB_READ_PORT
        ? Number(process.env.DB_READ_PORT)
        : (process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined),
};

export = readConfig;

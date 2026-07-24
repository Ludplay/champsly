import { Dialect } from 'sequelize';
import { EnvConfig } from './config-sequelize.types';

require('dotenv').config({ quiet: true });

const baseConfig: EnvConfig = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT as Dialect,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
};

const config: Record<string, EnvConfig> = {
    development: baseConfig,
    production: baseConfig,
};

export = config;

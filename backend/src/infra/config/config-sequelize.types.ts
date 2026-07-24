import { Options } from 'sequelize';

export interface EnvConfig extends Options {
    use_env_variable?: string;
}

import type { InferAttributes } from 'sequelize';
import type { Player } from '../../infra/db/models/player';

export type PlayerDTO = InferAttributes<Player>;

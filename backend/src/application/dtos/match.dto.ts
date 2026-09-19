import type { InferAttributes } from 'sequelize';
import type { Match } from '../../infra/db/models/match';

export type MatchDTO = InferAttributes<Match>;

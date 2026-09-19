import type { InferAttributes } from 'sequelize';
import type { Tournament } from '../../infra/db/models/tournament';
import type { PlayerDTO } from './player.dto';

export type TournamentDTO = InferAttributes<Tournament> & { Players?: PlayerDTO[] };

import type { InferAttributes } from 'sequelize';
import type { Phase } from '../../infra/db/models/phase';

export type PhaseDTO = InferAttributes<Phase> & { tournament?: string };

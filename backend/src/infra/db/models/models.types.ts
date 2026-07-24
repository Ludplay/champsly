import { Sequelize } from 'sequelize';
import type { Tournament } from './tournament';
import type { Player } from './player';
import type { Group } from './group';
import type { Phase } from './phase';
import type { Match } from './match';

export interface Db {
    Tournament: typeof Tournament;
    Player: typeof Player;
    Group: typeof Group;
    Phase: typeof Phase;
    Match: typeof Match;
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
}

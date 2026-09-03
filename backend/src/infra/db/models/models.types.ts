import { Sequelize } from 'sequelize';
import type { Tournament } from './tournament';
import type { Player } from './player';
import type { Group } from './group';
import type { Phase } from './phase';
import type { Match } from './match';
import type { User } from './user';
import type { RefreshToken } from './refresh-token';
import type { EmailVerificationToken } from './email-verification-token';

export interface Db {
    Tournament: typeof Tournament;
    Player: typeof Player;
    Group: typeof Group;
    Phase: typeof Phase;
    Match: typeof Match;
    User: typeof User;
    RefreshToken: typeof RefreshToken;
    EmailVerificationToken: typeof EmailVerificationToken;
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
}

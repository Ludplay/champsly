import { AccountStatus } from '../../shared/value-objects';

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginOutput {
    user: {
        id: number;
        name: string;
        email: string;
        status: AccountStatus;
    };
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

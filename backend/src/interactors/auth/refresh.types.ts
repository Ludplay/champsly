import { AccountStatus } from '../../shared/value-objects';

export interface RefreshInput {
    refreshToken: string | undefined;
}

export interface RefreshOutput {
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

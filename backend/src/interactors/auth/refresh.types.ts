export interface RefreshInput {
    refreshToken: string | undefined;
}

export interface RefreshOutput {
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

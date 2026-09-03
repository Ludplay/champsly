export interface AccessTokenClaims {
    sub: string;
    jti: string;
}

export interface IssuedAccessToken {
    token: string;
    jti: string;
    expiresAt: Date;
}

export interface IssuedOpaqueToken {
    token: string;
    tokenHash: string;
    expiresAt: Date;
}

import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID, createHash } from 'crypto';
import type { AccessTokenClaims, IssuedAccessToken, IssuedOpaqueToken } from './token-service.types';

class TokenService {
    private accessTokenSecret: string;
    private accessTokenTtlSeconds: number;
    private refreshTokenTtlSeconds: number;
    private emailVerificationTokenTtlSeconds: number;

    constructor() {
        const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

        if (!accessTokenSecret) {
            throw new Error('JWT_ACCESS_SECRET environment variable is required');
        }

        this.accessTokenSecret = accessTokenSecret;
        this.accessTokenTtlSeconds = process.env.ACCESS_TOKEN_TTL_SECONDS ? Number(process.env.ACCESS_TOKEN_TTL_SECONDS) : 900;
        this.refreshTokenTtlSeconds = process.env.REFRESH_TOKEN_TTL_SECONDS ? Number(process.env.REFRESH_TOKEN_TTL_SECONDS) : 2592000;
        this.emailVerificationTokenTtlSeconds = process.env.EMAIL_VERIFICATION_TOKEN_TTL_SECONDS ? Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_SECONDS) : 86400;
    }

    // Access token: short-lived, stateless JWT. Claims are limited to sub/jti (iat/exp
    // added automatically by jsonwebtoken) — no email or other PII, since a JWT payload
    // is signed, not encrypted, and readable by anyone holding the token.
    issueAccessToken(userId: number): IssuedAccessToken {
        const jti = randomUUID();
        const expiresAt = new Date(Date.now() + this.accessTokenTtlSeconds * 1000);

        const claims: AccessTokenClaims = { sub: String(userId), jti };
        const token = jwt.sign(claims, this.accessTokenSecret, { expiresIn: this.accessTokenTtlSeconds });

        return { token, jti, expiresAt };
    }

    verifyAccessToken(token: string): AccessTokenClaims {
        const payload = jwt.verify(token, this.accessTokenSecret);

        if (typeof payload === 'string' || !payload.sub || !payload.jti) {
            throw new Error('Access token payload is malformed');
        }

        return { sub: payload.sub, jti: payload.jti as string };
    }

    // Refresh token: opaque random bytes, never a JWT — see issueOpaqueToken for why.
    issueRefreshToken(): IssuedOpaqueToken {
        return this.issueOpaqueToken(this.refreshTokenTtlSeconds);
    }

    // Email verification token: same opaque-token shape as a refresh token, just on its
    // own shorter TTL (24h default) — a single-use verification link, not a session credential.
    issueEmailVerificationToken(): IssuedOpaqueToken {
        return this.issueOpaqueToken(this.emailVerificationTokenTtlSeconds);
    }

    // Exposed so callers (login/refresh/logout/verify-email flows) can hash a presented
    // opaque token the same way, to look it up by its stored hash.
    hashOpaqueToken(rawToken: string): string {
        return createHash('sha256').update(rawToken).digest('hex');
    }

    // Opaque tokens (refresh, email verification) are random bytes, never a JWT — they
    // carry no claims to verify, so only their hash is ever persisted (per 3.1). A leaked
    // database dump must not hand out usable tokens, the same reasoning that keeps
    // passwords hashed rather than stored in plain text.
    private issueOpaqueToken(ttlSeconds: number): IssuedOpaqueToken {
        const token = randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        return { token, tokenHash: this.hashOpaqueToken(token), expiresAt };
    }
}

export = TokenService;

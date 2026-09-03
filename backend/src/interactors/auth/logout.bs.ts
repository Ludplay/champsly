import type { RefreshTokenRepository } from '../../shared/repositories/refresh-token.types';
import TokenService from '../../infra/auth/token-service';
import type { LogoutInput } from './logout.types';

class LogoutInteractor {
    private refreshTokenRepository: RefreshTokenRepository;
    private tokenService: TokenService;

    constructor(params: {
        refreshTokenRepository: RefreshTokenRepository;
        tokenService: TokenService;
    }) {
        this.refreshTokenRepository = params.refreshTokenRepository;
        this.tokenService = params.tokenService;
    }

    // Idempotent by design: no cookie, an unknown token, or an already-revoked one
    // all end the same way — the caller is logged out either way, so there's nothing
    // to reveal to a client presenting a stale or forged token.
    async execute(input: LogoutInput): Promise<void> {
        if (!input.refreshToken) {
            return;
        }

        const tokenHash = this.tokenService.hashOpaqueToken(input.refreshToken);
        const presentedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if (!presentedToken || presentedToken.revoked_at) {
            return;
        }

        await this.refreshTokenRepository.revoke(presentedToken.id);
    }
}

export = LogoutInteractor;

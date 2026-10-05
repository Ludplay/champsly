import type { UserRepository } from '../../shared/repositories/user.types';
import type { RefreshTokenRepository } from '../../shared/repositories/refresh-token.types';
import TokenService from '../../infra/auth/token-service';
import { UnauthorizedError } from '../../shared/errors';
import type { RefreshInput, RefreshOutput } from './refresh.types';

class RefreshInteractor {
    private userRepository: UserRepository;
    private refreshTokenRepository: RefreshTokenRepository;
    private tokenService: TokenService;

    constructor(params: {
        userRepository: UserRepository;
        refreshTokenRepository: RefreshTokenRepository;
        tokenService: TokenService;
    }) {
        this.userRepository = params.userRepository;
        this.refreshTokenRepository = params.refreshTokenRepository;
        this.tokenService = params.tokenService;
    }

    async execute(input: RefreshInput): Promise<RefreshOutput> {
        const invalidRefreshTokenError = new UnauthorizedError('Invalid refresh token');

        if (!input.refreshToken) {
            throw invalidRefreshTokenError;
        }

        const tokenHash = this.tokenService.hashOpaqueToken(input.refreshToken);
        const presentedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if (!presentedToken) {
            throw invalidRefreshTokenError;
        }

        // Reuse of a token already rotated away is the standard signal it was stolen and replayed — kill
        // everything descended from it rather than trust either holder, and make both sides re-login.
        if (presentedToken.revoked_at) {
            await this.refreshTokenRepository.revokeChain(presentedToken.id);
            throw invalidRefreshTokenError;
        }

        if (presentedToken.expires_at.getTime() < Date.now()) {
            throw invalidRefreshTokenError;
        }

        // The frontend keeps its session in memory only, so it restores itself on page
        // load through this endpoint — which therefore has to return the user too.
        const user = await this.userRepository.findById(presentedToken.user_id);

        if (!user) {
            throw invalidRefreshTokenError;
        }

        const accessToken = this.tokenService.issueAccessToken(presentedToken.user_id);
        const newRefreshToken = this.tokenService.issueRefreshToken();

        const createdToken = await this.refreshTokenRepository.create({
            user_id: presentedToken.user_id,
            token_hash: newRefreshToken.tokenHash,
            expires_at: newRefreshToken.expiresAt
        });

        await this.refreshTokenRepository.revoke(presentedToken.id, createdToken.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status
            },
            accessToken: accessToken.token,
            accessTokenExpiresAt: accessToken.expiresAt,
            refreshToken: newRefreshToken.token,
            refreshTokenExpiresAt: newRefreshToken.expiresAt
        };
    }
}

export = RefreshInteractor;
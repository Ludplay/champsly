import type { UserRepository } from '../../shared/repositories/user.types';
import type { RefreshTokenRepository } from '../../shared/repositories/refresh-token.types';
import PasswordHasher from '../../infra/auth/password-hasher';
import TokenService from '../../infra/auth/token-service';
import { Email } from '../../shared/value-objects';
import { UnauthorizedError } from '../../shared/errors';
import type { LoginInput, LoginOutput } from './login.types';

class LoginInteractor {
    private userRepository: UserRepository;
    private refreshTokenRepository: RefreshTokenRepository;
    private passwordHasher: PasswordHasher;
    private tokenService: TokenService;

    constructor(params: {
        userRepository: UserRepository;
        refreshTokenRepository: RefreshTokenRepository;
        passwordHasher: PasswordHasher;
        tokenService: TokenService;
    }) {
        this.userRepository = params.userRepository;
        this.refreshTokenRepository = params.refreshTokenRepository;
        this.passwordHasher = params.passwordHasher;
        this.tokenService = params.tokenService;
    }

    async execute(input: LoginInput): Promise<LoginOutput> {
        const email = new Email(input.email);
        const user = await this.userRepository.findByEmail(email.toString());

        // Same generic error for "no such user" and "wrong password" — avoids leaking
        // which one it was (account enumeration).
        const invalidCredentialsError = new UnauthorizedError('Invalid email or password');

        if (!user) {
            // Run a dummy hash comparison anyway, so a missing-user response doesn't
            // return measurably faster than a wrong-password one (timing side channel).
            await this.passwordHasher.compare(input.password, await this.passwordHasher.hash(input.password));
            throw invalidCredentialsError;
        }

        const isPasswordValid = await this.passwordHasher.compare(input.password, user.password_hash);

        if (!isPasswordValid) {
            throw invalidCredentialsError;
        }

        const accessToken = this.tokenService.issueAccessToken(user.id);
        const refreshToken = this.tokenService.issueRefreshToken();

        await this.refreshTokenRepository.create({
            user_id: user.id,
            token_hash: refreshToken.tokenHash,
            expires_at: refreshToken.expiresAt
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status
            },
            accessToken: accessToken.token,
            accessTokenExpiresAt: accessToken.expiresAt,
            refreshToken: refreshToken.token,
            refreshTokenExpiresAt: refreshToken.expiresAt
        };
    }
}

export = LoginInteractor;

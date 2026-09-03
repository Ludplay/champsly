import { CreationAttributes } from 'sequelize';
import type { UserRepository } from '../../shared/repositories/user.types';
import type { RefreshTokenRepository } from '../../shared/repositories/refresh-token.types';
import type { EmailVerificationTokenRepository } from '../../shared/repositories/email-verification-token.types';
import type { EventBus } from '../../shared/events/event-bus.types';
import PasswordHasher from '../../infra/auth/password-hasher';
import TokenService from '../../infra/auth/token-service';
import { User } from '../../infra/db/models/user';
import { Email, AccountStatus } from '../../shared/value-objects';
import { UserRegistered } from '../../shared/events';

interface RegistrationInput {
    name: string;
    email: string;
    password: string;
}

interface RegistrationOutput {
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

class RegistrationInteractor {
    private userRepository: UserRepository;
    private refreshTokenRepository: RefreshTokenRepository;
    private emailVerificationTokenRepository: EmailVerificationTokenRepository;
    private passwordHasher: PasswordHasher;
    private tokenService: TokenService;
    private eventBus: EventBus;

    constructor(params: {
        userRepository: UserRepository;
        refreshTokenRepository: RefreshTokenRepository;
        emailVerificationTokenRepository: EmailVerificationTokenRepository;
        passwordHasher: PasswordHasher;
        tokenService: TokenService;
        eventBus: EventBus;
    }) {
        this.userRepository = params.userRepository;
        this.refreshTokenRepository = params.refreshTokenRepository;
        this.emailVerificationTokenRepository = params.emailVerificationTokenRepository;
        this.passwordHasher = params.passwordHasher;
        this.tokenService = params.tokenService;
        this.eventBus = params.eventBus;
    }

    async execute(input: RegistrationInput): Promise<RegistrationOutput> {
        const { name, password } = input;
        const email = new Email(input.email);
        const passwordHash = await this.passwordHasher.hash(password);

        const userRecord: CreationAttributes<User> = {
            name,
            email: email.toString(),
            password_hash: passwordHash,
            status: AccountStatus.PendingVerification
        };

        const user = await this.userRepository.create(userRecord);

        const accessToken = this.tokenService.issueAccessToken(user.id);
        const refreshToken = this.tokenService.issueRefreshToken();
        const emailVerificationToken = this.tokenService.issueEmailVerificationToken();

        await this.refreshTokenRepository.create({
            user_id: user.id,
            token_hash: refreshToken.tokenHash,
            expires_at: refreshToken.expiresAt
        });

        await this.emailVerificationTokenRepository.create({
            user_id: user.id,
            token_hash: emailVerificationToken.tokenHash,
            expires_at: emailVerificationToken.expiresAt
        });

        // Only announce the user exists once every write it depends on has succeeded.
        const userRegisteredEvent = new UserRegistered(user.id, user.email, user.name, emailVerificationToken.token);
        await this.eventBus.publish(userRegisteredEvent);

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

export = RegistrationInteractor;

import { CreationAttributes } from 'sequelize';
import type { UserRepository } from '../../shared/repositories/user.types';
import type { RefreshTokenRepository } from '../../shared/repositories/refresh-token.types';
import type { OutboxRepository } from '../../shared/repositories/outbox.types';
import type { TransactionManager, RequiredTransactionOptions } from '../../shared/persistence/transaction-manager.types';
import PasswordHasher from '../../infra/auth/password-hasher';
import TokenService from '../../infra/auth/token-service';
import { User } from '../../infra/db/models/user';
import { RefreshToken } from '../../infra/db/models/refresh-token';
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
    private passwordHasher: PasswordHasher;
    private tokenService: TokenService;
    private outboxRepository: OutboxRepository;
    private transactionManager: TransactionManager;

    constructor(params: {
        userRepository: UserRepository;
        refreshTokenRepository: RefreshTokenRepository;
        passwordHasher: PasswordHasher;
        tokenService: TokenService;
        outboxRepository: OutboxRepository;
        transactionManager: TransactionManager;
    }) {
        this.userRepository = params.userRepository;
        this.refreshTokenRepository = params.refreshTokenRepository;
        this.passwordHasher = params.passwordHasher;
        this.tokenService = params.tokenService;
        this.outboxRepository = params.outboxRepository;
        this.transactionManager = params.transactionManager;
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

        const refreshToken = this.tokenService.issueRefreshToken();

        const user = await this.transactionManager.run(async (transaction) => {
            const transactionOptions: RequiredTransactionOptions = { transaction };
            const createdUser = await this.userRepository.create(userRecord, transactionOptions);

            const refreshTokenRecord: CreationAttributes<RefreshToken> = {
                user_id: createdUser.id,
                token_hash: refreshToken.tokenHash,
                expires_at: refreshToken.expiresAt
            };

            await this.refreshTokenRepository.create(refreshTokenRecord, transactionOptions);

            // Committed together with the user, so the verification email is never sent for a rolled-back account.
            const userRegisteredEvent = new UserRegistered(createdUser.id);
            await this.outboxRepository.add(userRegisteredEvent, transactionOptions);

            return createdUser;
        });

        const accessToken = this.tokenService.issueAccessToken(user.id);

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

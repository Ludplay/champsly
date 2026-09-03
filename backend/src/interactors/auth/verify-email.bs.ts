import type { UserRepository } from '../../shared/repositories/user.types';
import type { EmailVerificationTokenRepository } from '../../shared/repositories/email-verification-token.types';
import TokenService from '../../infra/auth/token-service';
import { AccountStatus } from '../../shared/value-objects';
import { ValidationError } from '../../shared/errors';

interface VerifyEmailInput {
    token: string;
}

interface VerifyEmailOutput {
    user: {
        id: number;
        name: string;
        email: string;
        status: AccountStatus;
    };
}

class VerifyEmailInteractor {
    private userRepository: UserRepository;
    private emailVerificationTokenRepository: EmailVerificationTokenRepository;
    private tokenService: TokenService;

    constructor(params: {
        userRepository: UserRepository;
        emailVerificationTokenRepository: EmailVerificationTokenRepository;
        tokenService: TokenService;
    }) {
        this.userRepository = params.userRepository;
        this.emailVerificationTokenRepository = params.emailVerificationTokenRepository;
        this.tokenService = params.tokenService;
    }

    async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
        const tokenHash = this.tokenService.hashOpaqueToken(input.token);
        const verificationToken = await this.emailVerificationTokenRepository.findByTokenHash(tokenHash);

        const isExpired = !!verificationToken && verificationToken.expires_at.getTime() < Date.now();
        const isAlreadyUsed = !!verificationToken && verificationToken.used_at !== null;

        if (!verificationToken || isExpired || isAlreadyUsed) {
            throw new ValidationError('This verification link is invalid, used, or has expired. Please request a new one.');
        }

        // User status flips first, token is marked used second — if the process dies
        // in between, the token is still valid and can be retried, rather than being
        // burned while the user was never actually marked verified.
        const user = await this.userRepository.update(verificationToken.user_id, { status: AccountStatus.Verified });
        await this.emailVerificationTokenRepository.markUsed(verificationToken.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        };
    }
}

export = VerifyEmailInteractor;

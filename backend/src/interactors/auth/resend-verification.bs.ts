import type { UserRepository } from '../../shared/repositories/user.types';
import type { EmailVerificationTokenRepository } from '../../shared/repositories/email-verification-token.types';
import type { EmailSender } from '../../shared/mail/email-sender.types';
import TokenService from '../../infra/auth/token-service';
import { Email, AccountStatus } from '../../shared/value-objects';
import type { ResendVerificationInput } from './resend-verification.types';

class ResendVerificationInteractor {
    private userRepository: UserRepository;
    private emailVerificationTokenRepository: EmailVerificationTokenRepository;
    private tokenService: TokenService;
    private emailSender: EmailSender;

    constructor(params: {
        userRepository: UserRepository;
        emailVerificationTokenRepository: EmailVerificationTokenRepository;
        tokenService: TokenService;
        emailSender: EmailSender;
    }) {
        this.userRepository = params.userRepository;
        this.emailVerificationTokenRepository = params.emailVerificationTokenRepository;
        this.tokenService = params.tokenService;
        this.emailSender = params.emailSender;
    }

    // Silently no-ops for an unknown or already-verified email — same outcome
    // either way, so the response can't be used to enumerate accounts.
    async execute(input: ResendVerificationInput): Promise<void> {
        const email = new Email(input.email);
        const user = await this.userRepository.findByEmail(email.toString());

        if (!user || user.status !== AccountStatus.PendingVerification) {
            return;
        }

        const emailVerificationToken = this.tokenService.issueEmailVerificationToken();

        await this.emailVerificationTokenRepository.create({
            user_id: user.id,
            token_hash: emailVerificationToken.tokenHash,
            expires_at: emailVerificationToken.expiresAt
        });

        const publicUrl = process.env.PUBLIC_URL;
        const verificationLink = `${publicUrl}/verify-email?token=${emailVerificationToken.token}`;

        await this.emailSender.send({
            to: user.email,
            subject: 'Verify your Champsly account',
            body: `Hi ${user.name}, please verify your email by visiting: ${verificationLink}`
        });
    }
}

export = ResendVerificationInteractor;

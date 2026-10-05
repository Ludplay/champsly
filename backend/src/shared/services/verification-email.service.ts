import { CreationAttributes } from 'sequelize';
import type { EmailVerificationTokenRepository } from '../repositories/email-verification-token.types';
import type { EmailSender, EmailMessage } from '../mail/email-sender.types';
import type { TransactionOptions } from '../persistence/transaction-manager.types';
import type TokenService from '../../infra/auth/token-service';
import { User } from '../../infra/db/models/user';
import { EmailVerificationToken } from '../../infra/db/models/email-verification-token';

class VerificationEmailService {
    private emailVerificationTokenRepository: EmailVerificationTokenRepository;
    private tokenService: TokenService;
    private emailSender: EmailSender;

    constructor(params: {
        emailVerificationTokenRepository: EmailVerificationTokenRepository;
        tokenService: TokenService;
        emailSender: EmailSender;
    }) {
        this.emailVerificationTokenRepository = params.emailVerificationTokenRepository;
        this.tokenService = params.tokenService;
        this.emailSender = params.emailSender;
    }

    // Only the token's hash is stored; the raw token exists solely inside the emailed link.
    async send(user: User, options: TransactionOptions = {}): Promise<void> {
        const emailVerificationToken = this.tokenService.issueEmailVerificationToken();

        const tokenRecord: CreationAttributes<EmailVerificationToken> = {
            user_id: user.id,
            token_hash: emailVerificationToken.tokenHash,
            expires_at: emailVerificationToken.expiresAt
        };

        await this.emailVerificationTokenRepository.create(tokenRecord, options);

        const publicUrl = process.env.PUBLIC_URL;
        const verificationLink = `${publicUrl}/verify-email?token=${emailVerificationToken.token}`;

        const message: EmailMessage = {
            to: user.email,
            subject: 'Verify your Champsly account',
            body: `Hi ${user.name}, please verify your email by visiting: ${verificationLink}`
        };

        await this.emailSender.send(message);
    }
}

export = VerificationEmailService;

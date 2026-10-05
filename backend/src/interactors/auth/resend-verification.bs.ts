import type { UserRepository } from '../../shared/repositories/user.types';
import type VerificationEmailService from '../../shared/services/verification-email.service';
import { Email, AccountStatus } from '../../shared/value-objects';
import type { ResendVerificationInput } from './resend-verification.types';

class ResendVerificationInteractor {
    private userRepository: UserRepository;
    private verificationEmailService: VerificationEmailService;

    constructor(params: {
        userRepository: UserRepository;
        verificationEmailService: VerificationEmailService;
    }) {
        this.userRepository = params.userRepository;
        this.verificationEmailService = params.verificationEmailService;
    }

    // Silently no-ops for an unknown or already-verified email — same outcome
    // either way, so the response can't be used to enumerate accounts.
    async execute(input: ResendVerificationInput): Promise<void> {
        const email = new Email(input.email);
        const user = await this.userRepository.findByEmail(email.toString());

        if (!user || user.status !== AccountStatus.PendingVerification) {
            return;
        }

        await this.verificationEmailService.send(user);
    }
}

export = ResendVerificationInteractor;

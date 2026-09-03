import type { EmailSender, EmailMessage } from '../../shared/mail/email-sender.types';
import logger from '../config/logger';

/**
 * Stand-in for a real mail provider (SES, in Phase 10) — logs the message via Pino
 * instead of sending it. Building against the EmailSender port means the eventual
 * move to a real provider touches one new adapter file, not the registration or
 * verification flow itself.
 */
class ConsoleEmailSender implements EmailSender {
    private logger: typeof logger;

    constructor(params: { logger: typeof logger }) {
        this.logger = params.logger;
    }

    async send(message: EmailMessage): Promise<void> {
        this.logger.info({ to: message.to, subject: message.subject, body: message.body }, 'Email sent (console sender)');
    }
}

export = ConsoleEmailSender;

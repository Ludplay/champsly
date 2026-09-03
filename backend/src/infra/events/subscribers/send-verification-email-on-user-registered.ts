import type { EventBus } from '../../../shared/events/event-bus.types';
import type { EmailSender, EmailMessage } from '../../../shared/mail/email-sender.types';
import { UserRegistered } from '../../../shared/events';

class SendVerificationEmailOnUserRegisteredSubscriber {
    private eventBus: EventBus;
    private emailSender: EmailSender;

    constructor(params: { eventBus: EventBus; emailSender: EmailSender }) {
        this.eventBus = params.eventBus;
        this.emailSender = params.emailSender;
    }

    // Called once at startup (app.ts) to wire the subscription — kept as an explicit
    // method rather than a constructor side effect, so the wiring is visible at the
    // call site instead of hidden inside instantiation.
    subscribe(): void {
        this.eventBus.subscribe(UserRegistered, (event) => this.handle(event));
    }

    private async handle(event: UserRegistered): Promise<void> {
        const publicUrl = process.env.PUBLIC_URL;
        const verificationLink = `${publicUrl}/verify-email?token=${event.verificationToken}`;

        const message: EmailMessage = {
            to: event.email,
            subject: 'Verify your Champsly account',
            body: `Hi ${event.name}, please verify your email by visiting: ${verificationLink}`
        };

        await this.emailSender.send(message);
    }
}

export = SendVerificationEmailOnUserRegisteredSubscriber;
import { DomainEvent } from './domain-event';

export class UserRegistered extends DomainEvent {
    readonly email: string;
    readonly name: string;
    readonly verificationToken: string;

    constructor(userId: number, email: string, name: string, verificationToken: string) {
        super(userId);
        this.email = email;
        this.name = name;
        this.verificationToken = verificationToken;
    }
}

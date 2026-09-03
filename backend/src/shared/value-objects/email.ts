const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
    readonly value: string;

    constructor(value: string) {
        const normalized = value.trim().toLowerCase();

        if (!EMAIL_FORMAT.test(normalized)) {
            throw new Error(`Email must be a valid email address, got "${value}"`);
        }

        this.value = normalized;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

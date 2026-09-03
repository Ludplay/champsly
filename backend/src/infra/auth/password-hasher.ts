import bcrypt from 'bcrypt';

class PasswordHasher {
    private costFactor: number;

    constructor() {
        this.costFactor = process.env.PASSWORD_HASH_COST ? Number(process.env.PASSWORD_HASH_COST) : 12;
    }

    async hash(plainTextPassword: string): Promise<string> {
        return bcrypt.hash(plainTextPassword, this.costFactor);
    }

    async compare(plainTextPassword: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(plainTextPassword, passwordHash);
    }
}

export = PasswordHasher;

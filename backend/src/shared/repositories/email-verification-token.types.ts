import { CreationAttributes } from 'sequelize';
import { EmailVerificationToken } from '../../infra/db/models/email-verification-token';

export interface EmailVerificationTokenRepository {
    create(data: CreationAttributes<EmailVerificationToken>): Promise<EmailVerificationToken>;
    findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null>;
    markUsed(id: number): Promise<void>;
}

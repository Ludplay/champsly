import { CreationAttributes } from 'sequelize';
import { EmailVerificationToken } from '../../infra/db/models/email-verification-token';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface EmailVerificationTokenRepository {
    create(data: CreationAttributes<EmailVerificationToken>, options?: TransactionOptions): Promise<EmailVerificationToken>;
    findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null>;
    markUsed(id: number, options?: TransactionOptions): Promise<void>;
}

import { CreationAttributes } from 'sequelize';
import { EmailVerificationToken } from '../../../infra/db/models/email-verification-token';
import type { Db } from '../../../infra/db/models/models.types';
import type { EmailVerificationTokenRepository } from '../../../shared/repositories/email-verification-token.types';
import type { TransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizeEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
    private emailVerificationTokenModel: typeof EmailVerificationToken;

    constructor(params: { models: Db }) {
        this.emailVerificationTokenModel = params.models.EmailVerificationToken;
    }

    async create(data: CreationAttributes<EmailVerificationToken>, options: TransactionOptions = {}) {
        return await this.emailVerificationTokenModel.create(data, options);
    }

    async findByTokenHash(tokenHash: string) {
        return await this.emailVerificationTokenModel.findOne({ where: { token_hash: tokenHash } });
    }

    async markUsed(id: number, options: TransactionOptions = {}) {
        await this.emailVerificationTokenModel.update({ used_at: new Date() }, { where: { id }, transaction: options.transaction });
    }
}

export = SequelizeEmailVerificationTokenRepository;

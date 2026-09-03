import { CreationAttributes } from 'sequelize';
import { EmailVerificationToken } from '../../infra/db/models/email-verification-token';
import type { Db } from '../../infra/db/models/models.types';
import type { EmailVerificationTokenRepository } from '../../shared/repositories/email-verification-token.types';

class SequelizeEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
    private emailVerificationTokenModel: typeof EmailVerificationToken;

    constructor(params: { models: Db }) {
        this.emailVerificationTokenModel = params.models.EmailVerificationToken;
    }

    async create(data: CreationAttributes<EmailVerificationToken>) {
        return await this.emailVerificationTokenModel.create(data);
    }

    async findByTokenHash(tokenHash: string) {
        return await this.emailVerificationTokenModel.findOne({ where: { token_hash: tokenHash } });
    }

    async markUsed(id: number) {
        await this.emailVerificationTokenModel.update({ used_at: new Date() }, { where: { id } });
    }
}

export = SequelizeEmailVerificationTokenRepository;

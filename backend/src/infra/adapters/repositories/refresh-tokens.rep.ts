import { CreationAttributes } from 'sequelize';
import { RefreshToken } from '../../../infra/db/models/refresh-token';
import type { Db } from '../../../infra/db/models/models.types';
import type { RefreshTokenRepository } from '../../../shared/repositories/refresh-token.types';

class SequelizeRefreshTokenRepository implements RefreshTokenRepository {
    private refreshTokenModel: typeof RefreshToken;

    constructor(params: { models: Db }) {
        this.refreshTokenModel = params.models.RefreshToken;
    }

    async create(data: CreationAttributes<RefreshToken>) {
        return await this.refreshTokenModel.create(data);
    }

    async findByTokenHash(tokenHash: string) {
        return await this.refreshTokenModel.findOne({ where: { token_hash: tokenHash } });
    }

    async revoke(id: number, replacedById: number | null = null) {
        await this.refreshTokenModel.update(
            { revoked_at: new Date(), replaced_by_id: replacedById },
            { where: { id } }
        );
    }

    async revokeChain(startId: number) {
        const now = new Date();
        let currentId: number | null = startId;

        while (currentId !== null) {
            const token: RefreshToken | null = await this.refreshTokenModel.findByPk(currentId);

            if (!token) {
                break;
            }

            if (!token.revoked_at) {
                await token.update({ revoked_at: now });
            }

            currentId = token.replaced_by_id;
        }
    }
}

export = SequelizeRefreshTokenRepository;

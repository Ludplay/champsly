import { CreationAttributes } from 'sequelize';
import { RefreshToken } from '../../infra/db/models/refresh-token';

export interface RefreshTokenRepository {
    create(data: CreationAttributes<RefreshToken>): Promise<RefreshToken>;
    findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
    // Marks one row revoked (rotation sets replacedById to the token that succeeded it; logout leaves it null).
    revoke(id: number, replacedById?: number | null): Promise<void>;
    // Walks the replaced_by_id chain forward from startId, revoking every not-yet-revoked row it finds — the theft-response for a reused refresh token.
    revokeChain(startId: number): Promise<void>;
}

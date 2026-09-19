import { CreationAttributes, UniqueConstraintError } from 'sequelize';
import { ConflictError, NotFoundError } from '../../../shared/errors';
import { User } from '../../../infra/db/models/user';
import type { Db } from '../../../infra/db/models/models.types';
import type { UserRepository } from '../../../shared/repositories/user.types';

class SequelizeUserRepository implements UserRepository {
    private userModel: typeof User;

    constructor(params: { models: Db }) {
        this.userModel = params.models.User;
    }

    async findById(id: number) {
        return await this.userModel.findByPk(id);
    }

    async findByEmail(email: string) {
        return await this.userModel.findOne({ where: { email } });
    }

    async create(data: CreationAttributes<User>) {
        try {
            return await this.userModel.create(data);
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                throw new ConflictError('An account with this email already exists');
            }

            throw err;
        }
    }

    async update(id: number, data: Partial<CreationAttributes<User>>) {
        const user = await this.userModel.findByPk(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await user.update(data);
        return user;
    }
}

export = SequelizeUserRepository;

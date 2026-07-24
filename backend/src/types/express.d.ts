import { AwilixContainer } from 'awilix';
import { Cradle } from '../infra/config/register';

declare global {
    namespace Express {
        interface Request {
            container: AwilixContainer<Cradle>;
        }
    }
}

export {};

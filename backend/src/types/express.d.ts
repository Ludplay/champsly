import { AwilixContainer } from 'awilix';
import { Cradle } from '../infra/config/register';

declare global {
    namespace Express {
        interface Request {
            container: AwilixContainer<Cradle>;            
            user?: { id: number }; // Set by authenticate.middleware.ts once the access token verifies.
        }
    }
}

export {};

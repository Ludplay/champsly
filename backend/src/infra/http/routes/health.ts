import { Router, type Request, type Response } from 'express';
import type HealthCheck from '../../observability/health-check';

const HTTP_OK = 200;
const HTTP_SERVICE_UNAVAILABLE = 503;

// Liveness never touches dependencies: a DB outage must not make the orchestrator restart the process.
export function createHealthRouter(healthCheck: HealthCheck): Router {
    const router = Router();

    router.get('/health', (_req: Request, res: Response) => {
        res.status(HTTP_OK).json({ status: 'ok' });
    });

    router.get('/health/ready', async (_req: Request, res: Response) => {
        const report = await healthCheck.checkReadiness();
        const statusCode = report.status === 'ready' ? HTTP_OK : HTTP_SERVICE_UNAVAILABLE;

        res.status(statusCode).json(report);
    });

    return router;
}

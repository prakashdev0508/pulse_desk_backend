import { Router } from 'express';
import { checkDatabase, checkRedis, getSystemInfo , socketHealthCheck } from '../services/healthCheck';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const [dbStatus, redisStatus , socketStatus] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      socketHealthCheck(),
    ]); 

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        socket: socketStatus,
      },
      system: getSystemInfo(),
    });
  } catch (error : any) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    });
  }
});

export default router; 
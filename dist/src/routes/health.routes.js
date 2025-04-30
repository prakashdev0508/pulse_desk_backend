"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthCheck_1 = require("../services/healthCheck");
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    try {
        const [dbStatus, redisStatus, socketStatus] = await Promise.all([
            (0, healthCheck_1.checkDatabase)(),
            (0, healthCheck_1.checkRedis)(),
            (0, healthCheck_1.socketHealthCheck)(),
        ]);
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                redis: redisStatus,
                socket: socketStatus,
            },
            system: (0, healthCheck_1.getSystemInfo)(),
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message,
        });
    }
});
exports.default = router;

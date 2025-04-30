"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const envalid_1 = require("envalid");
const validateEnv = () => {
    (0, envalid_1.cleanEnv)(process.env, {
        NODE_ENV: (0, envalid_1.str)({ choices: ['development', 'production', 'test'] }),
        PORT: (0, envalid_1.port)({ default: 5000 }),
        DATABASE_URL: (0, envalid_1.url)(),
        JWT_SECRET: (0, envalid_1.str)(),
        JWT_REFRESH_SECRET: (0, envalid_1.str)(),
        JWT_EXPIRES_IN: (0, envalid_1.str)(),
        JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
        REDIS_URL: (0, envalid_1.url)(),
        CORS_ORIGIN: (0, envalid_1.str)(),
        LOG_LEVEL: (0, envalid_1.str)({ choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] }),
        RATE_LIMIT_WINDOW_MS: (0, envalid_1.str)(),
        RATE_LIMIT_MAX_REQUESTS: (0, envalid_1.str)(),
    });
};
exports.validateEnv = validateEnv;

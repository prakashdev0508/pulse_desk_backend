import { cleanEnv, str, port, bool, url } from 'envalid';

export const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: port({ default: 5000 }),
    DATABASE_URL: url(),
    JWT_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    JWT_EXPIRES_IN: str(),
    JWT_REFRESH_EXPIRES_IN: str(),
    REDIS_URL: url(),
    CORS_ORIGIN: str(),
    LOG_LEVEL: str({ choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] }),
    RATE_LIMIT_WINDOW_MS: str(),
    RATE_LIMIT_MAX_REQUESTS: str(),
  });
}; 
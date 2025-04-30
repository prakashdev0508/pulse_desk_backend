"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = require("dotenv");
const validateEnv_1 = require("./config/validateEnv");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./config/logger");
const auth_routes_1 = __importDefault(require("./modules/auth/routes/auth.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
// Load environment variables
(0, dotenv_1.config)();
// Validate environment variables
(0, validateEnv_1.validateEnv)();
exports.app = (0, express_1.default)();
// Security middleware
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS configuration
exports.app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
});
exports.app.use(limiter);
// Performance middleware
exports.app.use((0, compression_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Logging
exports.app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
// Routes
exports.app.use('/api/v1/auth', auth_routes_1.default);
exports.app.use('/api/v1', health_routes_1.default);
// Error handling
exports.app.use(errorHandler_1.errorHandler);
// 404 handler
exports.app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyPricingAndAcces = exports.logout = exports.refreshAccessToken = exports.verifyroles = exports.verifyToken = void 0;
const dbconfig_1 = require("../config/db/dbconfig");
const messageResponse_1 = require("../utils/messageResponse");
const token_service_1 = require("../services/token.service");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next((0, messageResponse_1.createError)(401, 'No token provided'));
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, token_service_1.verifyAccessToken)(token);
        const user = await dbconfig_1.prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return next((0, messageResponse_1.createError)(401, 'User not found'));
        }
        if (!user.isActive) {
            return next((0, messageResponse_1.createError)(401, 'User is not active'));
        }
        if (user.is_deleted) {
            return next((0, messageResponse_1.createError)(401, 'User is deleted'));
        }
        if (!user.is_Verified) {
            return next((0, messageResponse_1.createError)(401, 'User is not verified'));
        }
        const roleSlugs = await dbconfig_1.prisma.userRoles.findMany({
            where: {
                userId: user.id,
            },
        });
        res.locals.userId = user.id;
        res.locals.roles = roleSlugs;
        res.locals.organizationId = user.organizationId;
        res.locals.userName = user.name;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next((0, messageResponse_1.createError)(401, 'Token expired'));
        }
        return next((0, messageResponse_1.createError)(401, 'Invalid token'));
    }
};
exports.verifyToken = verifyToken;
const verifyroles = (accessRole) => {
    return async (req, res, next) => {
        try {
            const userRoles = res.locals.roles;
            if (!userRoles || userRoles.length === 0) {
                return next((0, messageResponse_1.createError)(403, 'No roles found for user'));
            }
            const hasAccess = userRoles.some((role) => accessRole.includes(role));
            if (!hasAccess) {
                return next((0, messageResponse_1.createError)(403, 'Unauthorized: Access forbidden'));
            }
            next();
        }
        catch (error) {
            console.error('Role verification error:', error);
            return next((0, messageResponse_1.createError)(500, 'Role verification error'));
        }
    };
};
exports.verifyroles = verifyroles;
const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next((0, messageResponse_1.createError)(401, 'Refresh token is required'));
        }
        const decoded = (0, token_service_1.verifyRefreshToken)(refreshToken);
        const user = await dbconfig_1.prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user || user.refreshToken !== refreshToken) {
            return next((0, messageResponse_1.createError)(401, 'Invalid refresh token'));
        }
        const { accessToken, refreshToken: newRefreshToken } = (0, token_service_1.generateTokens)(user.id);
        await (0, token_service_1.saveRefreshToken)(user.id, newRefreshToken);
        res.json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        return next((0, messageResponse_1.createError)(401, 'Invalid refresh token'));
    }
};
exports.refreshAccessToken = refreshAccessToken;
const logout = async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        await (0, token_service_1.removeRefreshToken)(userId);
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        return next((0, messageResponse_1.createError)(500, 'Error during logout'));
    }
};
exports.logout = logout;
const companyPricingAndAcces = async (req, res, next) => {
    next();
};
exports.companyPricingAndAcces = companyPricingAndAcces;

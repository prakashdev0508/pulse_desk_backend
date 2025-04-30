"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRefreshToken = exports.saveRefreshToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbconfig_1 = require("../config/db/dbconfig");
const messageResponse_1 = require("../utils/messageResponse");
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_key';
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' } // Access token expires in 15 minutes
    );
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' } // Refresh token expires in 7 days
    );
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw (0, messageResponse_1.createError)(401, 'Invalid access token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        throw (0, messageResponse_1.createError)(401, 'Invalid refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const saveRefreshToken = async (userId, refreshToken) => {
    try {
        await dbconfig_1.prisma.user.update({
            where: { id: userId },
            data: { refreshToken }
        });
    }
    catch (error) {
        throw (0, messageResponse_1.createError)(500, 'Failed to save refresh token');
    }
};
exports.saveRefreshToken = saveRefreshToken;
const removeRefreshToken = async (userId) => {
    try {
        await dbconfig_1.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        });
    }
    catch (error) {
        throw (0, messageResponse_1.createError)(500, 'Failed to remove refresh token');
    }
};
exports.removeRefreshToken = removeRefreshToken;

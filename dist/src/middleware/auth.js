"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyPricingAndAcces = exports.verifyroles = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbconfig_1 = require("@/config/db/dbconfig");
const messageResponse_1 = require("@/utils/messageResponse");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return (0, messageResponse_1.createError)(401, "You are not authenticated!");
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decodedToken) {
            return (0, messageResponse_1.createError)(401, "Invalid token please login again!");
        }
        const userId = decodedToken.id;
        const user = await dbconfig_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return (0, messageResponse_1.createError)(401, "User not found!");
        }
        if (!user.isActive) {
            return (0, messageResponse_1.createError)(401, "User is not active!");
        }
        if (user.is_deleted) {
            return (0, messageResponse_1.createError)(401, "User is deleted!");
        }
        if (!user.is_Verified) {
            return (0, messageResponse_1.createError)(401, "User is not verified please verify!");
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
    }
    catch (error) {
        console.error("Error verifying token:", error);
        return (0, messageResponse_1.createError)(401, "Token verification failed!");
    }
};
exports.verifyToken = verifyToken;
const verifyroles = (accessRole) => {
    return async (req, res, next) => {
        try {
            const userRoles = res.locals.roles;
            if (!userRoles || userRoles.length === 0) {
                return next((0, messageResponse_1.createError)(403, "No roles found for user"));
            }
            const hasAccess = userRoles.some((role) => accessRole.includes(role));
            if (!hasAccess) {
                return next((0, messageResponse_1.createError)(403, "Unauthorized : Access forbidden "));
            }
            next();
        }
        catch (error) {
            console.error("Role verification error:", error);
            return next((0, messageResponse_1.createError)(500, "Role verification error"));
        }
    };
};
exports.verifyroles = verifyroles;
const companyPricingAndAcces = async (req, res, next) => {
    next();
};
exports.companyPricingAndAcces = companyPricingAndAcces;

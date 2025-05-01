"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.userLogin = exports.userRegister = exports.organizationRegister = void 0;
const dbconfig_1 = require("../../../config/db/dbconfig");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const messageResponse_1 = require("../../../utils/messageResponse");
const zod_1 = require("zod");
const authschema_1 = require("../../../schema/authschema");
const organisation_service_1 = require("../../../services/organisation.service");
const logger_1 = require("../../../config/logger");
const token_service_1 = require("../../../services/token.service");
/**
 * @desc    post organization registration
 * @route   POST /api/v1/auth/orgination/register
 * @access  Public
 */
const organizationRegister = async (req, res, next) => {
    try {
        const { organizationName, organisationAddress, password, slug, phoneNumber, email } = authschema_1.organizationRegisterSchema.parse(req.body);
        const slugCheck = await (0, organisation_service_1.organisationSlugcheck)(slug);
        if (!slugCheck) {
            next((0, messageResponse_1.createError)(400, 'Organization slug already exists'));
            return;
        }
        const existEmail = await dbconfig_1.prisma.user.findUnique({
            where: { email },
        });
        if (existEmail) {
            next((0, messageResponse_1.createError)(400, 'Email already exists'));
            return;
        }
        await dbconfig_1.prisma.$transaction(async (prisma) => {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const organization = await prisma.organization.create({
                data: {
                    name: organizationName,
                    slug: slug,
                    address: organisationAddress,
                    email,
                    phone: phoneNumber,
                },
            });
            const accountRole = await prisma.roles.findUnique({
                where: {
                    role_slug: 'account_owner',
                },
            });
            const user = await prisma.user.create({
                data: {
                    name: organizationName,
                    email,
                    password: hashedPassword,
                    organizationId: organization.id,
                    userRoles: {
                        create: {
                            roleId: accountRole?.id,
                        },
                    },
                },
            });
            if (!user) {
                next((0, messageResponse_1.createError)(400, 'User creation failed'));
                return;
            }
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            });
            const encryptedRefreshToken = await bcryptjs_1.default.hash(refreshToken, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: encryptedRefreshToken },
            });
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            });
            (0, messageResponse_1.createSuccess)(res, 'Organisation Created Successfully', {
                accessToken,
                refreshToken,
                id: organization.id,
                userId: user.id,
            }, 201);
        });
    }
    catch (error) {
        logger_1.logger.error('Organization registration error:', error);
        if (error instanceof zod_1.z.ZodError) {
            next((0, messageResponse_1.createError)(400, 'Validation error', error));
        }
        else {
            next((0, messageResponse_1.createError)(500, 'Internal server error'));
        }
    }
};
exports.organizationRegister = organizationRegister;
/**
 * @desc    post user registration
 * @route   POST /api/v1/auth/user/register
 * @access  Private
 */
const userRegister = async (req, res, next) => {
    try {
        const { name, email, password, organizationId } = authschema_1.userRegisterSchema.parse(req.body);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const existingUser = await dbconfig_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            next((0, messageResponse_1.createError)(400, 'User already exists'));
            return;
        }
    }
    catch (error) {
        logger_1.logger.error('User registration error:', error);
        if (error instanceof zod_1.z.ZodError) {
            next((0, messageResponse_1.createError)(400, 'Validation error', error));
        }
        else {
            next((0, messageResponse_1.createError)(500, 'Internal server error'));
        }
    }
};
exports.userRegister = userRegister;
/**
 * @desc    post user login
 * @route   POST /api/v1/auth/user/login
 * @access  Public
 */
const userLogin = async (req, res, next) => {
    try {
        const { email, password } = authschema_1.userLoginSchema.parse(req.body);
        const user = await dbconfig_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                password: true,
                userRoles: {
                    select: {
                        role: {
                            select: {
                                role_slug: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            next((0, messageResponse_1.createError)(400, 'User not found'));
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            next((0, messageResponse_1.createError)(400, 'Invalid password'));
            return;
        }
        const { accessToken, refreshToken } = (0, token_service_1.generateTokens)(user.id);
        await (0, token_service_1.saveRefreshToken)(user.id, refreshToken);
        const userData = {
            id: user.id,
            roles: user.userRoles.map((role) => role.role.role_slug),
        };
        (0, messageResponse_1.createSuccess)(res, 'User logged in successfully', {
            user: userData,
            accessToken,
            refreshToken,
        }, 200);
    }
    catch (error) {
        logger_1.logger.error('User login error:', error);
        if (error instanceof zod_1.z.ZodError) {
            next((0, messageResponse_1.createError)(400, 'Validation error', error));
        }
        else {
            next((0, messageResponse_1.createError)(500, 'Internal server error'));
        }
    }
};
exports.userLogin = userLogin;
/**
 * @desc    get user details
 * @route   GET /api/v1/auth/user/me
 * @access  Private
 */
const me = async (req, res, next) => {
    try {
        const userId = res.locals.userId;
        const user = await dbconfig_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                organizationId: true,
                userRoles: {
                    select: {
                        role: {
                            select: { role_slug: true },
                        },
                    },
                },
            },
        });
        (0, messageResponse_1.createSuccess)(res, 'User details', user, 200);
    }
    catch (error) {
        next((0, messageResponse_1.createError)(500, 'Internal server error'));
    }
};
exports.me = me;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegister = exports.organizationRegister = void 0;
const dbconfig_1 = require("@/config/db/dbconfig");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const messageResponse_1 = require("@/utils/messageResponse");
const authschema_1 = require("@/schema/authschema");
const zod_1 = require("zod");
/**
 * @desc    post organization registration
 * @route   GET /api/v1/auth/orgination/register
 * @access  Public
 */
const organizationRegister = async (req, res, next) => {
    try {
        const { organizationName, organisationAddress, password, slug, phoneNumber, email, } = authschema_1.organizationRegisterSchema.parse(req.body);
        const existOrganisation = await dbconfig_1.prisma.organization.findUnique({
            where: { slug },
        });
        if (existOrganisation) {
            next((0, messageResponse_1.createError)(400, "Organization slug already exists"));
            return;
        }
        const existEmail = await dbconfig_1.prisma.user.findUnique({
            where: { email },
        });
        if (existEmail) {
            next((0, messageResponse_1.createError)(400, "Email already exists"));
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
                    role_slug: "account_owner",
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
                next((0, messageResponse_1.createError)(400, "User creation failed"));
                return;
            }
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: "10d",
            });
            const encryptedRefreshToken = await bcryptjs_1.default.hash(refreshToken, 10);
            user.refreshToken = encryptedRefreshToken;
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken },
            });
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next((0, messageResponse_1.createError)(403, "Validation error", error));
        }
        else {
            next((0, messageResponse_1.createError)(500, "Internal server error", error));
        }
    }
};
exports.organizationRegister = organizationRegister;
/**
 * @desc    post user registration
 * @route   GET /api/v1/auth/register/account-owner
 * @access  Private
 */
const userRegister = async (req, res, next) => {
    try {
        const { name, email, password, organizationId } = authschema_1.userRegisterSchema.parse(req.body);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Check if the user already exists
        const existingUser = await dbconfig_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            next((0, messageResponse_1.createError)(400, "User already exists"));
            return;
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next((0, messageResponse_1.createError)(403, "Validation error", error));
        }
        else {
            next((0, messageResponse_1.createError)(500, "Internal server error", error));
        }
    }
};
exports.userRegister = userRegister;

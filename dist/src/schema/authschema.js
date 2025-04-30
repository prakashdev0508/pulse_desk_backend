"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginSchema = exports.organizationRegisterSchema = exports.userRegisterSchema = void 0;
const zod_1 = require("zod");
exports.userRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Name is required" }),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    organizationId: zod_1.z
        .string()
        .min(1, { message: "Organization name is required" }),
});
exports.organizationRegisterSchema = zod_1.z.object({
    organizationName: zod_1.z
        .string()
        .min(1, { message: "Organization name is required" }),
    organisationAddress: zod_1.z.string().optional(),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    phoneNumber: zod_1.z.string().optional(),
    slug: zod_1.z.string({ message: "Slug is required" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
});
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
});

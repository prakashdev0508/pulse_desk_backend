import { z } from "zod";

export const userRegisterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  organizationId: z
    .string()
    .min(1, { message: "Organization name is required" }),
});


export const organizationRegisterSchema = z.object({
  organizationName: z
    .string()
    .min(1, { message: "Organization name is required" }),
  organisationAddress: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().optional(),
  slug : z.string({message : "Slug is required"}),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
} );

export const userLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const policyPermissionSchema = z.object({
  permission: z.string().min(1, { message: "Permission is required" }),
});

export const policyRegisterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  policyType: z.enum(["SYSTEM", "CUSTOM"]).optional(),
  permissions: z.array(policyPermissionSchema).optional(),
});
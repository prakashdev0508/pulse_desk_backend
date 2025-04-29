import { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db/dbconfig";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "@/utils/messageResponse";
import {
  organizationRegisterSchema,
  userRegisterSchema,
} from "@/schema/authschema";
import { z } from "zod";

/**
 * @desc    post organization registration
 * @route   GET /api/v1/auth/orgination/register
 * @access  Public
 */

export const organizationRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      organizationName,
      organisationAddress,
      password,
      slug,
      phoneNumber,
      email,
    } = organizationRegisterSchema.parse(req.body);

    const existOrganisation = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existOrganisation) {
      next(createError(400, "Organization slug already exists"));
      return;
    }

    const existEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existEmail) {
      next(createError(400, "Email already exists"));
      return;
    }

    await prisma.$transaction(async (prisma) => {
      const hashedPassword = await bcrypt.hash(password, 10);

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
              roleId: accountRole?.id as string,
            },
          },
        },
      });
      if (!user) {
        next(createError(400, "User creation failed"));
        return;
      }

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
          expiresIn: "10d",
        }
      );

      const encryptedRefreshToken = await bcrypt.hash(refreshToken, 10);

      user.refreshToken = encryptedRefreshToken;
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(403, "Validation error", error));
    } else {
      next(createError(500, "Internal server error", error));
    }
  }
};

/**
 * @desc    post user registration
 * @route   GET /api/v1/auth/register/account-owner
 * @access  Private
 */
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, organizationId } = userRegisterSchema.parse(
      req.body
    );
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      next(createError(400, "User already exists"));
      return;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(403, "Validation error", error));
    } else {
      next(createError(500, "Internal server error", error));
    }
  }
};

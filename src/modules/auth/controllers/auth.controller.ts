import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../config/db/dbconfig";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError, createSuccess } from "../../../utils/messageResponse";
import { z } from "zod";
import { organizationRegisterSchema, userRegisterSchema } from "../../../schema/authschema";
import { organisationSlugcheck } from "../../../services/organisation.service";
import { logger } from "../../../config/logger";

/**
 * @desc    post organization registration
 * @route   POST /api/v1/auth/orgination/register
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

    const slugCheck = await organisationSlugcheck(slug);

    if (!slugCheck) {
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
        process.env.JWT_REFRESH_SECRET as string,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        } as jwt.SignOptions
      );

      const encryptedRefreshToken = await bcrypt.hash(refreshToken, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: encryptedRefreshToken },
      });

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        } as jwt.SignOptions
      );

      createSuccess(
        res,
        "Organisation Created Successfully",
        {
          accessToken,
          refreshToken,
          id: organization.id,
          userId: user.id,
        },
        201
      );
    });
  } catch (error) {
    logger.error('Organization registration error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, "Validation error", error));
    } else {
      next(createError(500, "Internal server error"));
    }
  }
};

/**
 * @desc    post user registration
 * @route   POST /api/v1/auth/register/account-owner
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      next(createError(400, "User already exists"));
      return;
    }
  } catch (error) {
    logger.error('User registration error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, "Validation error", error));
    } else {
      next(createError(500, "Internal server error"));
    }
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../config/db/dbconfig';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createError, createSuccess } from '../../../utils/messageResponse';
import { z } from 'zod';
import {
  organizationRegisterSchema,
  userRegisterSchema,
  userLoginSchema,
} from '../../../schema/auth/authschema';
import { organisationSlugcheck } from '../../../services/organisation.service';
import { logger } from '../../../config/logger';
import { generateTokens, saveRefreshToken } from '../../../services/token.service';

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
    const { organizationName, organisationAddress, password, slug, phoneNumber, email } =
      organizationRegisterSchema.parse(req.body);

    const slugCheck = await organisationSlugcheck(slug);

    if (!slugCheck) {
      next(createError(400, 'Organization slug already exists'));
      return;
    }

    const existEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existEmail) {
      next(createError(400, 'Email already exists'));
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


      const user = await prisma.user.create({
        data: {
          name: organizationName,
          email,
          password: hashedPassword,
          organizationId: organization.id
        },
      });

      if (!user) {
        next(createError(400, 'User creation failed'));
        return;
      }

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
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
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        } as jwt.SignOptions
      );

      createSuccess(
        res,
        'Organisation Created Successfully',
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
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    post user registration
 * @route   POST /api/v1/auth/user/register
 * @access  Private
 */
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, organizationId } = userRegisterSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      next(createError(400, 'User already exists'));
      return;
    }
  } catch (error) {
    logger.error('User registration error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    post user login
 * @route   POST /api/v1/auth/user/login
 * @access  Public
 */

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = userLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      next(createError(400, 'User not found'));
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      next(createError(400, 'Invalid password'));
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await saveRefreshToken(user.id, refreshToken);

    const userData = {
      id: user.id,
    };

    createSuccess(
      res,
      'User logged in successfully',
      {
        user : userData,
        accessToken,
        refreshToken,
      },
      200
    );
  } catch (error) {
    logger.error('User login error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    get user details
 * @route   GET /api/v1/auth/user/me
 * @access  Private
 */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        organizationId: true,
      },
    });

    createSuccess(res, 'User details', user, 200);
  } catch (error) {
    next(createError(500, 'Internal server error'));
  }
};

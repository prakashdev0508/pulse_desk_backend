
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db/dbconfig";
import { createError } from "../utils/messageResponse";
import { generateTokens, removeRefreshToken, saveRefreshToken, verifyAccessToken, verifyRefreshToken } from '../services/token.service';

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(createError(401, 'User not found'));
    }

    if (!user.isActive) {
      return next(createError(401, 'User is not active'));
    }

    if (user.is_deleted) {
      return next(createError(401, 'User is deleted'));
    }

    if (!user.is_Verified) {
      return next(createError(401, 'User is not verified'));
    }

    const roleSlugs = await prisma.userRoles.findMany({
      where: {
        userId: user.id,
      },
    });

    res.locals.userId = user.id;
    res.locals.roles = roleSlugs;
    res.locals.organizationId = user.organizationId;
    res.locals.userName = user.name;
    next();
  } catch (error:any) {
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Token expired'));
    }
    return next(createError(401, 'Invalid token'));
  }
};

export const verifyroles = (accessRole: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = res.locals.roles;

      if (!userRoles || userRoles.length === 0) {
        return next(createError(403, 'No roles found for user'));
      }

      const hasAccess = userRoles.some((role: string) =>
        accessRole.includes(role)
      );

      if (!hasAccess) {
        return next(createError(403, 'Unauthorized: Access forbidden'));
      }

      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return next(createError(500, 'Role verification error'));
    }
  };
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(createError(401, 'Refresh token is required'));
    }

    const decoded = verifyRefreshToken(refreshToken) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return next(createError(401, 'Invalid refresh token'));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    await saveRefreshToken(user.id, newRefreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(createError(401, 'Invalid refresh token'));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    await removeRefreshToken(userId);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(createError(500, 'Error during logout'));
  }
};

export const companyPricingAndAcces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next();
};

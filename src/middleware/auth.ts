import expres from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db/dbconfig";
import { createError } from "@/utils/messageResponse";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return createError(401, "You are not authenticated!");
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decodedToken) {
      return createError(401, "Invalid token please login again!");
    }

    const userId = decodedToken.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return createError(401, "User not found!");
    }

    if (!user.isActive) {
      return createError(401, "User is not active!");
    }

    if (user.is_deleted) {
      return createError(401, "User is deleted!");
    }

    if (!user.is_Verified) {
      return createError(401, "User is not verified please verify!");
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
  } catch (error) {
    console.error("Error verifying token:", error);
    return createError(401, "Token verification failed!");
  }
};

export const verifyroles = (accessRole: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = res.locals.roles;

      if (!userRoles || userRoles.length === 0) {
        return next(createError(403, "No roles found for user"));
      }

      const hasAccess = userRoles.some((role: string) =>
        accessRole.includes(role)
      );

      if (!hasAccess) {
        return next(createError(403, "Unauthorized : Access forbidden "));
      }

      next();
    } catch (error) {
      console.error("Role verification error:", error);
      return next(createError(500, "Role verification error"));
    }
  };
};

export const companyPricingAndAcces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next();
};

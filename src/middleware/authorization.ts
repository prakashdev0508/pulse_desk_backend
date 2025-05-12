import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db/dbconfig';
import { createError } from '../utils/messageResponse';
import { verifyAccessTypes } from '../types/auth/roles';
import { logger } from '../config/logger';
import { redis } from '../config/redis';

export const verifyAccess = (data: verifyAccessTypes) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.userId;

      // Try to get permissions from cache first
      const userCacheKey = `user:${userId}:permissions`;
      const cachedData = await redis.get(userCacheKey);

      if (cachedData) {
        const { permissions } = JSON.parse(cachedData);
        const hasPermission = permissions.some(
          (p: { module: string; submodule: string; permission: string }) =>
            p.module === data.slug &&
            p.submodule === data.submodule &&
            p.permission === data.permission
        );

        if (!hasPermission) {
          return next(createError(403, 'You do not have permission to access this resource'));
        }
        return next();
      }

      // If not in cache, get from database
      const userRole = await prisma.userRoles.findFirst({
        where: {
          userId: userId,
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!userRole) {
        return next(createError(403, 'No role assigned to user'));
      }

      const hasPermission = userRole.role.permissions.some(
        (rolePermission) =>
          rolePermission.permission.module_slug === data.slug &&
          rolePermission.permission.sub_module_slug === data.submodule &&
          rolePermission.permission.permission_slug === data.permission
      );

      if (!hasPermission) {
        return next(createError(403, 'You do not have permission to access this resource'));
      }

      // Cache the permissions for future use
      const roles = [userRole.role.role_slug];
      const permissions = userRole.role.permissions.map(rp => ({
        module: rp.permission.module_slug,
        submodule: rp.permission.sub_module_slug,
        permission: rp.permission.permission_slug
      }));

      await redis.setex(userCacheKey, 3600, JSON.stringify({ roles, permissions }));

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      next(createError(500, 'Internal server error', error));
    }
  };
};

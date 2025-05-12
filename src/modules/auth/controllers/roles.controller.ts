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
import { createRolePermissionsSchema } from '../../../schema/auth/roles.schema';
import { ModuleSlug, PermissionSlug, SubModuleSlug } from '@prisma/client';
import { DEFAULT_ROLES } from '../../../utils/constants/roles';

/**
 * @desc    post create role permissions
 * @route   POST /api/v1/auth/role/permissions/create
 * @access  Private
 */

export const createRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { permission_name, description, module_slug, permission_slug, sub_module_slug } =
      createRolePermissionsSchema.parse(req.body);

    const rolePermission = await prisma.rolePermissions.create({
      data: {
        permission: permission_name,
        description,
        module_slug: module_slug as ModuleSlug,
        permission_slug: permission_slug as PermissionSlug,
        sub_module_slug: sub_module_slug as SubModuleSlug,
      },
    });

    createSuccess(res, 'Role created successfully', {
      id: rolePermission.id,
    });
  } catch (error) {
    logger.error('Role permissions creation error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    create bulk role permissions
 * @route   POST /api/v1/auth/role/permissions/bulk
 * @access  Private
 */

export const createBulkRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rolePermissions = [];

    for (const module of Object.values(ModuleSlug)) {
      for (const subModule of Object.values(SubModuleSlug)) {
        for (const permission of Object.values(PermissionSlug)) {
          rolePermissions.push({
            permission: `${module}_${subModule}_${permission}`,
            module_slug: module,
            sub_module_slug: subModule,
            permission_slug: permission,
            description: `Allows ${permission} on ${subModule} in ${module}`,
          });
        }
      }
    }

    await prisma.rolePermissions.createMany({
      data: rolePermissions,
      skipDuplicates: true, // Optional, in case you've seeded before
    });

    createSuccess(res, 'Bulk role permissions created successfully');
  } catch (error) {
    logger.error('Bulk role permissions creation error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    get all role permissions
 * @route   GET /api/v1/auth/role/permissions
 * @access  Private
 */

export const getAllRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rolePermissions = await prisma.rolePermissions.findMany({
      where: {
        NOT: {
          module_slug: 'saas',
        },
      },
      orderBy: {
        module_slug: 'asc',
      },
      select: {
        id: true,
        permission: true,
        description: true,
        module_slug: true,
        sub_module_slug: true,
        permission_slug: true,
      },
    });
    createSuccess(res, 'All role permissions fetched successfully', {
      rolePermissions,
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
 * @desc    create default roles
 * @route   POST /api/v1/auth/default/roles
 * @access  Private
 */

export const createDefaultRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.$transaction(
      async (tx) => {
        const createdRoles = [];

        for (const role of DEFAULT_ROLES) {
          // First create the role
          const createdRole = await tx.roles.create({
            data: {
              role_slug: role.role_slug,
              role_name: role.role_name,
              description: role.description,
              role_type: 'default',
              organizationId: null,
            },
          });

          // Then find permissions and create relationships
          const rolePermissions = await tx.rolePermissions.findMany({
            where: {
              module_slug: {
                notIn: role.not_permissions_module as ModuleSlug[],
              },
              sub_module_slug: {
                notIn: role.not_permissions_sub_module as SubModuleSlug[],
              },
            },
            select: {
              id: true,
            },
          });

          // Create role-permission relationships
          await tx.rolePermissionsToRoles.createMany({
            data: rolePermissions.map((permission) => ({
              roleId: createdRole.id,
              permissionId: permission.id,
            })),
          });

          createdRoles.push(createdRole);
        }

        return createdRoles;
      },
      {
        timeout: 10000, // 10 seconds timeout
        maxWait: 15000, // 15 seconds max wait
      }
    );

    createSuccess(res, 'Default roles created successfully', {
      roles,
    });
  } catch (error) {
    logger.error('Default roles creation error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    create role
 * @route   POST /api/v1/auth/role/create
 * @access  Private
 */

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {}
};

/**
 * @desc    get all roles
 * @route   GET /api/v1/auth/roles
 * @access  Private
 */

export const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.roles.findMany();

    createSuccess(res, 'All roles fetched successfully', {
      roles,
    });
  } catch (error) {
    logger.error('All roles fetching error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    assign role to user
 * @route   POST /api/v1/auth/roles/assign
 * @access  Private
 */

export const assignRoleToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, role_ids } = req.body;

    if (!user_id || !Array.isArray(role_ids) || role_ids.length === 0) {
      return next(createError(400, 'user_id and at least one role ID are required'));
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify all roles exist
      const roles = await tx.roles.findMany({
        where: { id: { in: role_ids } },
      });

      if (roles.length !== role_ids.length) {
        throw new Error('One or more roles not found');
      }

      // Delete existing role assignments
      await tx.userRoles.deleteMany({
        where: { userId: user_id },
      });

      // Create new role assignments
      await tx.userRoles.createMany({
        data: role_ids.map((roleId) => ({
          userId: user_id,
          roleId,
        })),
      });
    });

    createSuccess(res, 'Roles assigned to user successfully');
  } catch (error) {
    logger.error('Error assigning roles to user:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else if (error instanceof Error) {
      next(createError(404, error.message));
    } else {
      next(createError(500, 'Error assigning roles to user'));
    }
  }
};

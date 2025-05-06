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
import { logger } from '../../../config/logger';
import {
  createPolicyPermissionSchema,
  createPolicySchema,
} from '../../../schema/auth/policy.schema';
import { tryCatch } from 'bullmq';
import { PolicyPermissionKeys } from '@prisma/client';
import { assignPolicy } from '../../../services/auth/assignpolicy';

/**
 * @desc    post policy permission
 * @route   POST /api/v1/auth/policypermission/create
 * @access  Private
*/

export const createPolicyPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { permissionName, policyType, action, effect, key, description } =
      createPolicyPermissionSchema.parse(req.body);
    const existingPolicyPermission = await prisma.policyPermission.findFirst({
      where: {
        key: key as PolicyPermissionKeys,
        action: {
          hasSome: action
        },
        effect: effect,
      },
    });

    if (existingPolicyPermission) {
      return next(createError(400, 'Policy permission already exists'));
    }

    const policy = await prisma.policyPermission.create({
      data: {
        permissionName: permissionName,
        policyType: policyType,
        action: action,
        effect: effect,
        key: key as PolicyPermissionKeys,
        description: description,
      },
    });

    if (!policy) {
      return next(createError(400, 'Failed to create policy permission'));
    }

    createSuccess(res, 'Policy permission created successfully', {
      id: policy.id,
    });

    return;
  } catch (error) {
    logger.error('Error creating policy permission:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    get policy permission
 * @route   GET /api/v1/auth/policypermission/get
 * @access  Private
 */

export const getPolicyPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const policy = await prisma.policyPermission.findMany({
      where: {
        isActive: true,
        policyType: 'EXTERNAL',
      },
      select: {
        id: true,
        permissionName: true,
        action: true,
        effect: true,
      },
    });
    if (!policy) {
      return next(createError(400, 'Failed to get policy permission'));
    }
    createSuccess(res, 'Policy permission fetched successfully', {
      policy,
    });
    return;
  } catch (error) {
    logger.error('Error getting policy permission:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

/**
 * @desc    post policy create
 * @route   POST /api/v1/auth/policy/create
 * @access  Private
 */

export const policyCreate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { policyName, description, policyType, permissions } = createPolicySchema.parse(req.body);

    const organizationId = res.locals.organizationId;

    const policy = await prisma.policy.create({
      data: {
        policyName: policyName,
        description: description,
        policyType: policyType,
        organizationId: organizationId,
        permissions: {
          create: permissions.map((permissionId) => ({
            permission: { connect: { id: permissionId } },
          })),
        },
      },
    });

    if (!policy) {
      return next(createError(400, 'Failed to create policy'));
    }

    createSuccess(res, 'Policy created successfully', {
      id: policy.id,
    });

    return;
  } catch (error) {
    logger.error('Error creating policy:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(400, 'Failed to create policy', error));
    }
  }
};

/**
 * @desc    get policy
 * @route   GET /api/v1/auth/policy/get
 * @access  Private
 */

export const getPolicies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = res.locals.organizationId;

    const policy = await prisma.policy.findMany({
      where: {
        isActive: true,
        organizationId: organizationId,
      },
      select: {
        id: true,
        policyName: true,
        description: true,
        policyType: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                permissionName: true,
              },
            },
          },
        },
      },
    });

    if (!policy) {
      return next(createError(400, 'Failed to get policy'));
    }

    createSuccess(res, 'Policy fetched successfully', {
      policy,
    });

    return;
  } catch (error) {
    logger.error('Error getting policy:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(400, 'Failed to get policy', error));
    }
  }
};

/**
 * @desc    assign policy to user
 * @route   POST /api/v1/auth/policy/assign
 * @access  Private
 */

export const assignPolicyToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { policyId } = req.body;

    const organizationId = res.locals.organizationId;

    const userId = res.locals.userId 

    const userPolicy = await assignPolicy(policyId, userId , organizationId);

    createSuccess(res, 'Policy assigned to user successfully', {
      userPolicy,
    });

    return;
  } catch (error) {
    logger.error('Error assigning policy to user:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(400, 'Failed to assign policy to user', error));
    }
  }
};



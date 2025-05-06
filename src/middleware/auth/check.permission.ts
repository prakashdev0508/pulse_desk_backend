import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../config/db/dbconfig';
import { logger } from '../../config/logger';
import { PolicyAction, PolicyPermissionKeys } from '@prisma/client';

export const checkPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
  permissionKey: PolicyPermissionKeys,
  action: PolicyAction
) => {
  try {
    const userId = res.locals.userId;
    const organizationId = res.locals.organizationId;

    const policies = await prisma.userPolicy.findMany({
      where: {
        userId,
      },
      select: {
        policy: {
          select: {
            permissions: true,
            policyType: true,
            organizationId: true,
            isActive: true,
          },
        },
      },
    });


  } catch (error) {}
};

import { prisma } from '../../config/db/dbconfig';
import { logger } from '../../config/logger';
import { PolicyType } from '@prisma/client';

export const assignPolicy = async (policyId: string, userId: string, organizationId: string) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: {
        id: policyId,
      },
    });

    if (!policy) {
      throw new Error('Policy not found');
    }

    if (policy.organizationId !== organizationId && policy.policyType === PolicyType.CUSTOM) {
      throw new Error('Policy does not belong to your organization');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.organizationId !== organizationId) {
      throw new Error('User does not belong to your organization');
    }

    const userPolicy = await prisma.userPolicy.create({
      data: {
        userId,
        policyId,
      },
    });

    return userPolicy;
  } catch (error) {
    logger.error('Error assigning policy:', error);
    throw error;
  }
};

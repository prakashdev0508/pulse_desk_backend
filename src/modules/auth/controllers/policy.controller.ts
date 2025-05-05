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
} from '../../../schema/authschema';
import { organisationSlugcheck } from '../../../services/organisation.service';
import { logger } from '../../../config/logger';

/**
 * @desc    post policy register
 * @route   POST /api/v1/auth/policy/register
 * @access  Private
 */

export const policyRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

}

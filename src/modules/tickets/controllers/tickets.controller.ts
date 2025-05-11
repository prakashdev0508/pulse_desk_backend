import { Request, Response, NextFunction } from 'express';
import { createError, createSuccess } from '../../../utils/messageResponse';
import { logger } from '../../../config/logger';
import { createTicketSchema } from '../../../schema/tickets/tickets.schema';
import { z } from 'zod';
import { createTicketService } from '../../../services/tickets/ticket.services';

/**
 * @desc    post organization registration
 * @route   POST /api/v1/tickets/create
import { createTicketSchema } from '../../../schema/tickets.schema';
 * @access  Private
 */

export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      statusID,
      priority,
      customerId,
      organizationId,
      categoryId,
      subCategoryId,
      assignedToId,
      automationRuleId,
      escalationRuleId,
      customFields,
    } = createTicketSchema.parse(req.body);


    const ticketCreateResponse = await createTicketService(req.body)

    if(!ticketCreateResponse){
        return next(createError(400, 'Failed to create ticket'))
    }

    //send email to customer 

    //send email to assigned to 

    //apply automation rules

    


    
  } catch (error) {
    logger.error('Organization registration error:', error);
    if (error instanceof z.ZodError) {
      next(createError(400, 'Validation error', error));
    } else {
      next(createError(500, 'Internal server error'));
    }
  }
};

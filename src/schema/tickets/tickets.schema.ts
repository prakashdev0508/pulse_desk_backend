import { z } from 'zod';

export const createTicketSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    statusID: z.string().min(1),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    categoryId: z.string().min(1),
    subCategoryId: z.string().optional(),
    customerId: z.string().min(1),
    organizationId: z.string().min(1),
    assignedToId: z.string().optional(),
    assignedgroupId: z.string().optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    automationRuleId: z.string().optional(),
    escalationRuleId: z.string().optional(),
});

export interface CreateTicketData {
    title: string;
    description: string;
    statusID: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    categoryId: string;
    subCategoryId?: string;
    customerId: string;
    organizationId: string;
    assignedToId?: string;
    assignedgroupId?: string;
    customFields?: any;
    automationRuleId?: string;
    escalationRuleId?: string;
}


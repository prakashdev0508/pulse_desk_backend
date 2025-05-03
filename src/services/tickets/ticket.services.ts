import { prisma } from "../../config/db/dbconfig";
import { CreateTicketData } from "../../types/tickets/tickets";

export const createTicketService = async (data: CreateTicketData) => {
    try {
        const ticket = await prisma.ticket.create({
            data: {
                ...data,
                priority: data.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
            }
        });
        return ticket;
    } catch (error : any) {
        throw new Error(`Failed to create ticket: ${error.message}`);
    }
}

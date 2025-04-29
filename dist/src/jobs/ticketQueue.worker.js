"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
// Create a Worker to process "ticket-queue"
const ticketWorker = new bullmq_1.Worker("ticket-queue", async (job) => {
    console.log(`🎯 Processing Ticket Job - ID: ${job.id}`, job.data);
    // Example: Simulate auto-assigning ticket to a support agent
    const { ticketId } = job.data;
    console.log(`👨‍💻 Auto-assign ticket: ${ticketId} to an available agent`);
}, {
    connection: redis_1.redis,
});
ticketWorker.on("completed", (job) => {
    console.log(`✅ Ticket Job ${job.id} has been completed`);
});
ticketWorker.on("failed", (job, err) => {
    console.error(`❌ Ticket Job ${job?.id} failed:`, err.message);
});
exports.default = ticketWorker;

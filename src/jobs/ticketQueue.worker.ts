import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";

// Create a Worker to process "ticket-queue"
const ticketWorker = new Worker(
  "ticket-queue",
  async (job: Job) => {
    console.log(`🎯 Processing Ticket Job - ID: ${job.id}`, job.data);

    // Example: Simulate auto-assigning ticket to a support agent
    const { ticketId } = job.data;
    console.log(`👨‍💻 Auto-assign ticket: ${ticketId} to an available agent`);
  },
  {
    connection: redis,
  }
);

ticketWorker.on("completed", (job) => {
  console.log(`✅ Ticket Job ${job.id} has been completed`);
});

ticketWorker.on("failed", (job, err) => {
  console.error(`❌ Ticket Job ${job?.id} failed:`, err.message);
});

export default ticketWorker;

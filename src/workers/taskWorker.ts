import { Worker } from "bullmq";
import { redis } from "../config/redis";

const taskWorker = new Worker("task-queue", async job => {
  console.log(`🎯 Processing task job: ${job.id}`, job.data);

  // Perform your job logic here
}, { connection: redis });

taskWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} has been completed`);
});

taskWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} has failed`, err);
});

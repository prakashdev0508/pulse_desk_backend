"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const taskWorker = new bullmq_1.Worker("task-queue", async (job) => {
    console.log(`🎯 Processing task job: ${job.id}`, job.data);
    // Perform your job logic here
}, { connection: redis_1.redis });
taskWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} has been completed`);
});
taskWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} has failed`, err);
});

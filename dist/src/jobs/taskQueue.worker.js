"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
// Create a Worker to process "task-queue"
const taskWorker = new bullmq_1.Worker('task-queue', async (job) => {
    console.log(`🎯 Processing Task Job - ID: ${job.id}`, job.data);
    // Example: Simulate sending a notification when a task is created
    const { taskId } = job.data;
    console.log(`📢 Send notification: Task ${taskId} has been created!`);
}, {
    connection: redis_1.redis,
});
taskWorker.on('completed', (job) => {
    console.log(`✅ Task Job ${job.id} has been completed`);
});
taskWorker.on('failed', (job, err) => {
    console.error(`❌ Task Job ${job?.id} failed:`, err.message);
});
exports.default = taskWorker;

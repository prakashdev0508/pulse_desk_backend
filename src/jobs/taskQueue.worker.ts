import { Worker, Job } from 'bullmq';
import {redis} from '../config/redis';

// Create a Worker to process "task-queue"
const taskWorker = new Worker('task-queue', async (job: Job) => {
  console.log(`🎯 Processing Task Job - ID: ${job.id}`, job.data);

  // Example: Simulate sending a notification when a task is created
  const { taskId } = job.data;
  console.log(`📢 Send notification: Task ${taskId} has been created!`);

}, {
  connection: redis,
});

taskWorker.on('completed', (job) => {
  console.log(`✅ Task Job ${job.id} has been completed`);
});

taskWorker.on('failed', (job, err) => {
  console.error(`❌ Task Job ${job?.id} failed:`, err.message);
});

export default taskWorker;

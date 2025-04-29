import { createQueue } from "../config/queue";

export const taskQueue = createQueue("task-queue");

// Function to add job
export const addTaskJob = async (taskData: any) => {
  await taskQueue.add("new-task", taskData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};

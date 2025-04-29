"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaskJob = exports.taskQueue = void 0;
const queue_1 = require("../config/queue");
exports.taskQueue = (0, queue_1.createQueue)("task-queue");
// Function to add job
const addTaskJob = async (taskData) => {
    await exports.taskQueue.add("new-task", taskData, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
    });
};
exports.addTaskJob = addTaskJob;

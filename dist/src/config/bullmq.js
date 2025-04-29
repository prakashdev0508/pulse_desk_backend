"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketQueue = exports.taskQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.taskQueue = new bullmq_1.Queue("task-queue", {
    connection: redis_1.redis,
});
exports.ticketQueue = new bullmq_1.Queue("ticket-queue", {
    connection: redis_1.redis,
});

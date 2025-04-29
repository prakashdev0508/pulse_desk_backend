"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
const createQueue = (queueName) => {
    return new bullmq_1.Queue(queueName, {
        connection: redis_1.redis,
    });
};
exports.createQueue = createQueue;

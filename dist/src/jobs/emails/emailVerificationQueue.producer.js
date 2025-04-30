"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmailVerificationJob = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = require("../../config/logger");
const emailVerificationQueue = new bullmq_1.Queue('email-verification-queue', {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
});
const addEmailVerificationJob = async (email, verificationToken) => {
    try {
        const job = await emailVerificationQueue.add('send-verification-email', {
            email,
            verificationToken,
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
        logger_1.logger.info(`Added email verification job ${job.id} for ${email}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error('Failed to add email verification job:', error);
        throw error;
    }
};
exports.addEmailVerificationJob = addEmailVerificationJob;

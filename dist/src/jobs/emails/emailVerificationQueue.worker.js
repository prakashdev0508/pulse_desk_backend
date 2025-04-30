"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const email_service_1 = require("../../services/email.service");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('email-verification-queue', async (job) => {
    try {
        const { email, verificationToken } = job.data;
        logger_1.logger.info(`Processing email verification job ${job.id} for ${email}`);
        await (0, email_service_1.sendVerificationEmail)(email, verificationToken);
        logger_1.logger.info(`Successfully sent verification email to ${email}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to process email verification job ${job.id}:`, error);
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`Email verification job ${job.id} completed successfully`);
});
worker.on('failed', (job, error) => {
    logger_1.logger.error(`Email verification job ${job?.id} failed:`, error);
});
process.on('SIGTERM', async () => {
    await worker.close();
});

import { Queue } from 'bullmq';
import { logger } from '../../config/logger';

const emailVerificationQueue = new Queue('email-verification-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export const addEmailVerificationJob = async (email: string, verificationToken: string) => {
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

    logger.info(`Added email verification job ${job.id} for ${email}`);
    return job;
  } catch (error) {
    logger.error('Failed to add email verification job:', error);
    throw error;
  }
}; 
import { Worker } from 'bullmq';
import { sendVerificationEmail } from '../../services/email.service';
import { logger } from '../../config/logger';

const worker = new Worker(
  'email-verification-queue',
  async (job) => {
    try {
      const { email, verificationToken } = job.data;
      logger.info(`Processing email verification job ${job.id} for ${email}`);
      
      await sendVerificationEmail(email, verificationToken);
      
      logger.info(`Successfully sent verification email to ${email}`);
    } catch (error) {
      logger.error(`Failed to process email verification job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  }
);

worker.on('completed', (job) => {
  logger.info(`Email verification job ${job.id} completed successfully`);
});

worker.on('failed', (job, error) => {
  logger.error(`Email verification job ${job?.id} failed:`, error);
});

process.on('SIGTERM', async () => {
  await worker.close();
}); 
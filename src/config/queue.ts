import { Queue } from "bullmq";
import { redis } from "./redis";

export const createQueue = (queueName: string) => {
  return new Queue(queueName, {
    connection: redis,
  });
};

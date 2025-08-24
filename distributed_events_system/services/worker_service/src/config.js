import dotenv from "dotenv";
dotenv.config();

export const config = {
  postgresUrl: process.env.POSTGRES_URL,
  sqsQueueUrl: process.env.SQS_QUEUE_URL,
  awsRegion: process.env.AWS_REGION || "us-east-1",
  awsEndpoint: process.env.AWS_ENDPOINT,
  webhookBaseUrl: process.env.WEBHOOK_BASE_URL,
  redisUrl: process.env.REDIS_URL,
  pollWaitSeconds: Number(process.env.POLL_WAIT_SECONDS || 10),
  maxMessages: Number(process.env.MAX_MESSAGES || 5)
};

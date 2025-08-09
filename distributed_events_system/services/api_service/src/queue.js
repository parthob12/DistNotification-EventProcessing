import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { config } from "./config.js";

function buildSqsClient() {
  const base = { region: config.awsRegion };

  if (config.awsEndpoint) {
    base.endpoint = config.awsEndpoint;
    base.credentials = { accessKeyId: "test", secretAccessKey: "test" };
  }

  return new SQSClient(base);
}

const sqs = buildSqsClient();

export async function enqueueEvent({ eventId, type, createdAt }) {
  const body = JSON.stringify({ eventId, type, createdAt });

  const cmd = new SendMessageCommand({
    QueueUrl: config.sqsQueueUrl,
    MessageBody: body
  });

  await sqs.send(cmd);
}

import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand
} from "@aws-sdk/client-sqs";
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

export async function receiveMessages() {
  const cmd = new ReceiveMessageCommand({
    QueueUrl: config.sqsQueueUrl,
    MaxNumberOfMessages: config.maxMessages,
    WaitTimeSeconds: config.pollWaitSeconds,
    VisibilityTimeout: 30
  });

  const resp = await sqs.send(cmd);
  return resp.Messages || [];
}

export async function deleteMessage(receiptHandle) {
  const cmd = new DeleteMessageCommand({
    QueueUrl: config.sqsQueueUrl,
    ReceiptHandle: receiptHandle
  });

  await sqs.send(cmd);
}

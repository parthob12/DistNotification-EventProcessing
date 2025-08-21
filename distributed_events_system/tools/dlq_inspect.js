import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

const dlqUrl = process.env.DLQ_URL;
const region = process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.AWS_ENDPOINT;

if (!dlqUrl) {
  console.error("DLQ_URL is required");
  process.exit(1);
}

function buildClient() {
  const base = { region };

  if (endpoint) {
    base.endpoint = endpoint;
    base.credentials = { accessKeyId: "test", secretAccessKey: "test" };
  }

  return new SQSClient(base);
}

async function main() {
  const sqs = buildClient();

  const cmd = new ReceiveMessageCommand({
    QueueUrl: dlqUrl,
    MaxNumberOfMessages: 5,
    WaitTimeSeconds: 2
  });

  const resp = await sqs.send(cmd);
  const messages = resp.Messages || [];

  if (messages.length === 0) {
    console.log("DLQ is empty");
    return;
  }

  console.log("Messages currently in DLQ:");

  for (const msg of messages) {
    let body;
    try {
      body = JSON.parse(msg.Body);
    } catch {
      body = { raw: msg.Body };
    }

    console.log({
      messageId: msg.MessageId,
      eventId: body.eventId,
      type: body.type
    });
  }
}

main().catch((err) => {
  console.error("dlq_inspect_failed", err);
  process.exit(1);
});

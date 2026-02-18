Distributed Event Driven Notification and Event Processing System

Local run

1. Start a webhook receiver in a terminal on the host machine

   node tools/webhook_server.js

2. Start the stack

   docker compose -f infra/docker-compose.yml up --build

3. Send a test event

   node tools/send_event.js

Useful endpoints

API health
http://localhost:3000/health

API metrics
http://localhost:3000/metrics

Worker metrics
http://localhost:9100/metrics

DLQ inspection

export AWS_ENDPOINT=http://localhost:4566
export AWS_REGION=us-east-1
export DLQ_URL=http://localhost:4566/000000000000/events_dlq
node tools/dlq_inspect.js

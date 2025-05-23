#!/bin/sh
set -eu

awslocal sqs create-queue --queue-name events_dlq >/dev/null
awslocal sqs create-queue --queue-name events_queue >/dev/null

DLQ_URL="$(awslocal sqs get-queue-url --queue-name events_dlq --query 'QueueUrl' --output text)"
QUEUE_URL="$(awslocal sqs get-queue-url --queue-name events_queue --query 'QueueUrl' --output text)"

DLQ_ARN="$(awslocal sqs get-queue-attributes --queue-url "$DLQ_URL" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)"

awslocal sqs set-queue-attributes       --queue-url "$QUEUE_URL"       --attributes "RedrivePolicy={\"deadLetterTargetArn\":\"$DLQ_ARN\",\"maxReceiveCount\":\"3\"}"       >/dev/null

echo "localstack_init_done"

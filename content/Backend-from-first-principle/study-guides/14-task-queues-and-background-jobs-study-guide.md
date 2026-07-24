# Study guide — 14. Task queues and background jobs

> This is added guidance, not a claim about the video's contents.

## The reliability rules

- Make jobs idempotent: retries must not create duplicate side effects.
- Include a durable job identity and correlation/request ID.
- Treat the queue as at-least-once unless your exact platform and design prove a stronger guarantee.
- Define retryable vs. terminal failures, backoff, timeout, and dead-letter behavior.
- Make workers observable: queue depth, age, retry count, throughput, and failure rate.

## Learn by building: move an email out of the HTTP request

Install BullMQ and use Redis as the broker:

~~~bash
npm install bullmq
~~~

Create src/jobs/welcome-email.ts:

~~~ts
import { Queue, Worker } from "bullmq";

const connection = {
  host: "localhost",
  port: 6379,
};

export const welcomeEmailQueue = new Queue("welcome-email", {
  connection,
});

export const welcomeEmailWorker = new Worker(
  "welcome-email",
  async (job) => {
    const { userId, email } = job.data;

    await emailProvider.sendWelcomeEmail({
      userId,
      email,
    });
  },
  { connection },
);
~~~

The API route creates work but does not wait for delivery:

~~~ts
await welcomeEmailQueue.add(
  "send-welcome-email",
  { userId: user.id, email: user.email },
  {
    jobId: "welcome:" + user.id,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
);

return reply.code(202).send({
  status: "ACCEPTED",
});
~~~

Return 202 when the request has been accepted for asynchronous work, not when the email has definitely been delivered. Add an idempotency record in the database before a real provider call; retries can otherwise create duplicate side effects.

### Failure experiment

Make emailProvider throw once. Confirm the API still responds quickly, the job retries later, and your worker records a permanent failure only after the configured attempts are exhausted.

## Read next

- [RabbitMQ tutorials](https://www.rabbitmq.com/tutorials)
- [Celery documentation](https://docs.celeryq.dev/)
- [BullMQ documentation](https://docs.bullmq.io/)
- [Temporal documentation](https://docs.temporal.io/)
- [Amazon SQS developer guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)

## Public repositories worth studying

- [celery/celery](https://github.com/celery/celery)
- [taskforcesh/bullmq](https://github.com/taskforcesh/bullmq)
- [temporalio/temporal](https://github.com/temporalio/temporal)
- [rabbitmq/rabbitmq-server](https://github.com/rabbitmq/rabbitmq-server)
- [sidekiq/sidekiq](https://github.com/sidekiq/sidekiq)

## Build exercise

Build a welcome-email job with a retry policy and idempotency key. Simulate a provider timeout, prove the API remains responsive, and prove a retry cannot send two emails for the same event.

## Production job-system design

### Start from a delivery contract

Most queues deliberately provide at-least-once delivery: after a crash or acknowledgement problem, the same message can be delivered again. Design every handler as if it can run twice, arrive late, or arrive after a newer event. “Exactly once” is normally a business-level outcome you create with idempotency and durable state, not a magic property of a broker.

For an email task, persist an event or job row with a stable idempotency key before publishing it. When the worker receives the task, it atomically records that the effect is being performed or has already completed. A retry that sees a completed key returns safely rather than sending another message.

~~~text
request commits user and welcome-email event
publisher sends the durable event to the queue
worker claims event-id once
worker calls email provider with a provider idempotency key when available
worker marks the event completed, retryable, or permanently failed
~~~

### Avoid the database-to-queue gap

If an API commits a database transaction and then crashes before it publishes the queue message, the user exists but the job is lost. If it publishes first and the database transaction rolls back, the worker sees work for data that never existed. A transactional outbox solves this: write the business change and an outbox event in one database transaction, then let a reliable publisher deliver pending outbox records.

This is one of the most useful production patterns to learn because it replaces an impossible cross-system atomic commit with a recoverable local transaction and an idempotent consumer.

### Retry only the failures that may improve

Classify failures. Network timeouts, temporary provider outages, and rate limits may deserve exponential backoff with jitter. Invalid input, a missing record that will not appear, or a rejected request generally should not retry forever. Put terminal jobs in a dead-letter or failed-jobs store with the error class, attempt count, and correlation id so an operator can decide whether to repair and replay them.

Set a maximum attempt count and a maximum age. An old job can be actively harmful if it performs an action after the user has cancelled it or the current state has changed.

### Build backpressure into the worker fleet

The queue length is a signal, not a reason to start unlimited workers. Bound concurrency by the resource that is scarce: database connections, CPU, memory, or an external provider quota. Track queue age as well as queue depth; a small queue of old jobs can be more urgent than a large queue of fresh ones.

Workers should propagate a trace or correlation identifier from the originating request, log transitions using structured fields, expose counts for waiting/running/retried/failed jobs, and shut down by stopping new claims before allowing current work a limited time to finish. This makes an asynchronous operation debuggable from its API request to its final effect.

### Tests that prove the design

Test duplicate delivery, a crash after the side effect but before acknowledgement, delayed jobs, an outbox publisher restart, and a poisoned message. The goal is not merely that the happy-path job runs; it is that the job system reaches the intended business state under the failures it was created to absorb.

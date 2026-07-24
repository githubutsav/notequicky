# Study guide — 16. Error Handling and Building Fault Tolerant Systems

> This is added guidance, not a claim about the video's contents.

## A failure-handling playbook

- Classify failures: invalid input, conflict, unavailable dependency, timeout, bug, or security event.
- Decide the user-visible response independently from the internal diagnostic record.
- Attach request/trace IDs and safe contextual metadata to errors.
- Use timeouts, bounded retries with backoff, and idempotency where retries can occur.
- Test recovery paths intentionally: database unavailable, slow dependency, duplicate request, and invalid configuration.

## Learn by building: give failures stable meaning

Create one application-error type:

~~~ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
~~~

Use it in a service rather than throwing a database/provider error directly:

~~~ts
if (!product) {
  throw new AppError(
    "PRODUCT_NOT_FOUND",
    404,
    "The requested product does not exist.",
  );
}
~~~

Map it once at the HTTP boundary:

~~~ts
app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      code: error.code,
      message: error.message,
      requestId: request.id,
    });
  }

  request.log.error(error);
  return reply.code(500).send({
    code: "INTERNAL_ERROR",
    message: "Unexpected server error.",
    requestId: request.id,
  });
});
~~~

### Failure experiment

Create a fake payment client that times out. Decide explicitly: is the outcome retryable, pending reconciliation, or definitely failed? A timeout does not prove that the remote payment did not succeed. This is why payment writes need idempotency keys and a durable status record.

## Read next

- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)
- [Google SRE book](https://sre.google/sre-book/table-of-contents/)
- [OpenTelemetry documentation](https://opentelemetry.io/docs/)

## Public repositories worth studying

- [getsentry/sentry](https://github.com/getsentry/sentry)
- [open-telemetry/opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector)
- [resilience4j/resilience4j](https://github.com/resilience4j/resilience4j)
- [App-vNext/Polly](https://github.com/App-vNext/Polly)
- [cockroachdb/cockroach](https://github.com/cockroachdb/cockroach) — read failure-handling and testing areas selectively.

## Build exercise

Add a global error mapper to a small API. Simulate malformed input, a unique-constraint conflict, an unavailable dependency, and an unexpected bug. For each, assert the HTTP response, structured log fields, and alert/no-alert behavior.

## Production failure engineering

### Create a small, explicit error taxonomy

Define a small set of application error categories with stable codes. For example: invalid input, unauthenticated, forbidden, not found, conflict, rate limited, dependency unavailable, deadline exceeded, and internal error. Attach whether the client may retry, whether the event should be logged or alerted, and whether the original cause is safe to expose.

Controllers should not translate driver exceptions one-by-one. A repository or integration adapter turns vendor-specific failures into application errors; a global boundary turns application errors into the public response. This protects the rest of the code from database and provider vocabulary.

~~~text
public response: code, safe message, request-id, optional field details
internal event: error class, cause class, operation, dependency, trace-id, safe identifiers
~~~

### A retry is a policy, not a catch block

Retry only operations that are likely to succeed later and that are safe to repeat. Use bounded exponential backoff with jitter so a dependency outage does not produce a synchronized retry storm. Pair retries with deadlines; a request that waits forever is not fault tolerant. For a write to an external system, use an idempotency key or durable state before retrying, because a timeout may mean the remote side completed the action but the response was lost.

Circuit breakers and bulkheads are useful when a dependency is failing or slow. A breaker stops sending more work to a known-bad path for a short period. A bulkhead bounds the damage by giving that path limited concurrency or a separate connection pool. Neither is a substitute for correct data reconciliation after an uncertain write.

### Preserve data integrity under partial failure

When a request changes local data and triggers remote work, avoid making the user believe both operations happened just because the first transaction committed. Use an outbox, a compensating workflow, or an explicitly pending state. The API can then state the truthful outcome: accepted and processing, completed, or requires attention.

Add a correlation id at the ingress boundary and propagate it through database events, queue jobs, and dependency calls. During an incident, that identifier links the client-safe response to the trace and the exact recovery record.

### Test the unhappy paths deliberately

Inject timeouts, slow responses, duplicate messages, cancelled requests, malformed payloads, and failed database writes. Assert bounded latency as well as correct status codes. A useful resilience test asks: if this component returns late, returns twice, or restarts at this line, which state is visible to the user and can the team repair it without guessing?

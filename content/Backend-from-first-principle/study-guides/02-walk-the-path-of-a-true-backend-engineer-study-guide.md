# Study guide — 2. Walk the path of a true backend engineer

> This is added guidance, not a claim about the video's contents.

## The three-level study plan

| Level | Goal | Evidence that you learned it |
| --- | --- | --- |
| Principle | Explain the problem without code | You can draw the request/data flow |
| Implementation | Use one stack correctly | A small, tested endpoint works |
| System | Combine the parts safely | A deployable project has tests and observability |

Avoid switching stacks every week. Build the same small service twice only after the first implementation is solid; compare concepts, not syntax.

## Production learning plan

### Produce evidence, not just notes

For every topic, create one durable artifact:

- HTTP: a saved request/response trace.
- Validation: tests for malformed and malicious inputs.
- Database: a migration and an `EXPLAIN` output.
- Authentication: an authorization matrix and negative tests.
- Queue: an idempotency/retry test.
- Observability: a trace or dashboard screenshot linked to a request ID.
- Scaling: a repeatable load-test script with percentile results.

This makes learning cumulative. You are not only watching concepts—you are building a small portfolio of operational proof.

### Use a “definition of done” for every feature

Before calling a feature complete, answer:

1. What input is accepted and rejected?
2. Who may use it, and who may use this specific resource?
3. What is the database transaction or consistency boundary?
4. Can a client retry safely?
5. What user-facing response is returned for expected failures?
6. What logs, metrics, or traces will reveal an unexpected failure?
7. How is the feature tested at unit, integration, and HTTP-contract levels?

### Suggested eight-week build path

| Week | Deliverable |
| --- | --- |
| 1 | HTTP API, OpenAPI contract, validation, error format |
| 2 | PostgreSQL migrations, repository tests, pagination |
| 3 | Sessions/OAuth integration and object-level authorization |
| 4 | Caching plus invalidation and a queue-backed email task |
| 5 | Structured logs, traces, metrics, health/readiness |
| 6 | Security review, rate limiting, dependency updates |
| 7 | Load test, query profiling, performance improvement |
| 8 | Container deployment, graceful shutdown, runbook |

Do not skip the runbook. A two-page “how to diagnose a failure” document exposes missing observability and unclear ownership faster than another feature does.

## Learn by building: make one vertical slice

Do not learn backend work as a list of libraries. Build one vertical slice: accept a request, validate it, perform a small use case, and return a response. Add this route directly to the practice lab server:

~~~ts
import { z } from "zod";

const greetingBody = z.object({
  name: z.string().trim().min(1).max(80),
});

app.post("/greetings", async (request, reply) => {
  const input = greetingBody.parse(request.body);

  return reply.code(201).send({
    message: "Hello, " + input.name,
  });
});
~~~

Try it:

~~~bash
curl -i -X POST http://localhost:3000/greetings \
  -H "content-type: application/json" \
  -d '{"name":"Utsav"}'
~~~

Then deliberately send an invalid body:

~~~bash
curl -i -X POST http://localhost:3000/greetings \
  -H "content-type: application/json" \
  -d '{"name":""}'
~~~

At this stage, the invalid request will make Zod throw and your current error response may be ugly. That is useful: it gives you a real reason to learn validation and global error handling later, instead of treating them as abstract topics.

### What to notice

- The route owns HTTP details: method, path, status code, and body.
- The schema owns the external data contract.
- The business operation is intentionally tiny. First make one path understandable; then split code into controllers and services when repeated responsibilities appear.

## Read next

- [Go tour](https://go.dev/tour/)
- [Node.js learning resources](https://nodejs.org/en/learn)
- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110)
- [The Twelve-Factor App](https://12factor.net/)

## Public repositories worth studying

- [gothinkster/realworld](https://github.com/gothinkster/realworld) — compare equivalent implementations.
- [fastify/fastify](https://github.com/fastify/fastify) — a focused Node.js web framework.
- [go-chi/chi](https://github.com/go-chi/chi) — idiomatic routing and middleware in Go.
- [caddyserver/caddy](https://github.com/caddyserver/caddy) — a production server written in Go.
- [sveltejs/realworld](https://github.com/sveltejs/realworld) — use as a client/API contract comparison, not as a backend-only project.

## Build exercise

Implement the same `GET /books/:id` endpoint in two languages. Keep the HTTP contract identical, then list which parts were conceptual (route, validation, error response) and which were stack-specific.

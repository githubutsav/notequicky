# Study guide — 1. Roadmap for backend from first principles

> This is added guidance, not a claim about the video's contents.

## A practical learning loop

Choose one small API (for example, a reading-list service) and grow it in layers:

1. Serve one `GET` endpoint and inspect its raw HTTP exchange.
2. Add input validation, a service layer, and a database repository.
3. Add authentication and authorization before adding more features.
4. Add structured logs, metrics, graceful shutdown, tests, and a load test.
5. Document the API with OpenAPI and deploy it in a container.

Keep a one-page architecture note for every change: request path, state owner, failure mode, and how you will observe it.

## Production-level roadmap: what “done” should mean

A production-level backend is not “a project that works on my machine.” It is a service with explicit behavior under success, invalid input, outages, deployment, and growth. Build your learning project in these stages.

### Stage A — correct request handling

Build a small API with a clear HTTP contract. Define request and response schemas, validation errors, status codes, authentication, and authorization. Keep controllers thin: their job is to translate HTTP into an application use case and translate the result back.

**Production invariant:** untrusted input never reaches business logic or the database without parsing and validation.

### Stage B — durable state and failure boundaries

Add PostgreSQL, migrations, transactions where a business operation must be atomic, and an explicit repository boundary. Add timeouts to every network/database call. Decide which operations can be retried, which need idempotency keys, and which should move to a queue.

**Production invariant:** a retry or timeout must not silently duplicate money movement, email delivery, or irreversible state.

### Stage C — operate the service

Add structured logs, request/trace IDs, a latency histogram, error counter, health/readiness endpoints, configuration validation, and graceful shutdown. Do not wait for a future “DevOps phase”; without these, you cannot tell whether a system is healthy.

**Production invariant:** an operator can identify a failed request, its deployment/version, its dependency calls, and whether the failure is still happening.

### Stage D — scale based on evidence

Create a load test before optimizing. Record p50/p95/p99 latency, throughput, errors, CPU, memory, database query count, and cache hit rate. Fix the bottleneck you measured, then rerun the same workload. Caching, replicas, queues, and horizontal scaling are solutions to specific constraints—not default architecture decorations.

**Production invariant:** every performance change has a before/after measurement and a documented trade-off.

## Capstone project blueprint

Build a multi-tenant team task API. Include users, organizations, projects, tasks, invitations, role-based access, pagination, background email jobs, file attachment metadata, audit logs, and an OpenAPI contract. It is small enough to finish, but rich enough to exercise every topic in the playlist.

For each feature, write a short decision record:

- What is the source of truth?
- Which user may act on which object?
- What happens if a dependency is unavailable?
- How is duplicate delivery prevented?
- Which metric or trace proves this feature is healthy?

## Learn by building: establish a reliable starting point

Start in the shared [practice lab](../PRACTICE-LAB.md). Do not begin with users, authentication, databases, and queues all at once. First prove that one request can enter the process, be logged, and receive a predictable response.

Add a request identifier hook to src/server.ts:

~~~ts
import { randomUUID } from "node:crypto";

app.addHook("onRequest", async (request, reply) => {
  const requestId = request.headers["x-request-id"] ?? randomUUID();

  request.log = request.log.child({
    requestId,
  });
  reply.header("x-request-id", requestId);
});
~~~

What this teaches:

- A backend request has context, not only a URL.
- A request id is returned to the caller and included in server logs, so one failure can be followed later.
- Middleware/hooks run before route handlers, which is why this is the right place for cross-cutting concerns.

Run the server and make two requests:

~~~bash
curl -i http://localhost:3000/health
curl -i -H "x-request-id: practice-001" http://localhost:3000/health
~~~

The second response should contain the same request id. This small feature is the beginning of observability, not an optional cosmetic header.

### Your first checkpoint

Before moving on, explain this request path aloud:

~~~text
client -> TCP/HTTP listener -> Fastify hook -> route handler
       -> JSON response -> client
~~~

If the server cannot start, the error belongs to startup/configuration. If the server starts but the route returns the wrong result, the error belongs to request handling. Learn to name the boundary before you try to fix it.

## Read next

- [MDN HTTP reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [The Twelve-Factor App](https://12factor.net/)

## Public repositories worth studying

- [gothinkster/realworld](https://github.com/gothinkster/realworld) — the same application implemented in multiple stacks.
- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) — system-design exercises and references.
- [microsoft/api-guidelines](https://github.com/microsoft/api-guidelines) — API-design conventions and rationale.
- [open-telemetry/opentelemetry-demo](https://github.com/open-telemetry/opentelemetry-demo) — a distributed application with telemetry.
- [GoogleCloudPlatform/microservices-demo](https://github.com/GoogleCloudPlatform/microservices-demo) — a larger reference system for later study.

## Build exercise

Make a `GET /health` endpoint, then write down every component that must exist before you would trust it in production: timeout, log line, test, deployment configuration, and monitoring signal.

# 10. What are controllers, services, repositories, middlewares and request context?

Video: [YouTube](https://www.youtube.com/watch?v=hyc-7w3pee8&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=10)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

The video groups closely related request-processing concepts: handlers/controllers, services, repositories, middleware, and request context. Its main theme is responsibility boundaries along a request's path through the application.

## Key lessons from the video

- A handler/controller receives request and response objects, binds/reads request data, invokes application work, and selects an appropriate response.
- Services contain the processing/business work and should not need to decide HTTP response details.
- Repositories concentrate database interaction so persistence code is not spread through handlers or services.
- Middleware receives request, response, and a `next` capability; it can do shared work and continue the pipeline or terminate a request early.
- Examples of shared middleware concerns include CORS, logging, authentication, rate limiting, data parsing, compression, and global error handling.
- Middleware order is important; the video discusses deciding which checks happen early and preserving a consistent pipeline.
- Request context carries request-scoped information, such as authenticated identity/role, trace information, and cancellation/deadline signals for downstream work.

## Detailed teaching notes from the video

### A handler/controller owns the HTTP conversation

The video describes a handler/controller as the point where a matched request becomes application work. It receives the request and response objects from the runtime/framework, extracts values, performs binding/validation/transformation, calls an appropriate service, and turns the result into a status code and response body.

The controller should coordinate the exchange rather than contain every business rule. If it directly performs complex database work, emails, authorization logic, and response formatting, it becomes hard to test and hard to reuse.

### A service owns the use case, not the transport

The service layer receives the data needed to perform an operation. It applies the use case/business logic and calls repositories or other collaborators. In the video’s framing, the service should not need to decide whether an HTTP response is 200, 201, or 400; that is the controller’s transport concern.

For example, “create an order and reserve stock” is a service use case. The service may call a repository and a payment/inventory dependency, but it should not need to know whether the client was a browser, mobile app, or scheduled job.

### A repository owns database interaction

Repositories collect persistence operations so handlers/services do not scatter raw database access everywhere. The video positions this as a clean responsibility boundary: the repository knows how data is queried or written; the service knows why it needs the data and what to do with the result.

This separation is especially valuable for testing and migrations. You can test a service’s decisions with a controlled repository implementation, then test the actual repository against a real database separately.

### Middleware is shared work in the request pipeline

Middleware resembles a handler with an additional next capability. It can inspect/modify request/response state, stop the request early, or pass execution onward. The video uses shared concerns as examples: CORS, authentication, rate limiting, logging/monitoring, body parsing, compression, and error handling.

The next function makes the order visible: each middleware decides whether execution continues. This is why order is behavior, not formatting. Logging before authentication sees failed attempts; authentication before an expensive handler prevents unauthorized work; global error handling needs to wrap downstream failures.

### Middleware order is a security and performance decision

The video discusses CORS, logging, authentication, and global error handling as an ordered flow. A practical interpretation is:

~~~text
request ID / recovery
  → trusted proxy / origin policy
  → body limits + parsing
  → authentication
  → authorization/rate limit
  → route handler/controller
  → central error mapping
~~~

Your exact order depends on the framework and need, but you should be able to justify it. Put expensive work after cheap rejection checks; put error recovery around code that may throw; do not log secrets merely because raw logging is early.

### Request context carries request-scoped facts and lifecycle signals

The video explains context as temporary state for one request: user identity/role discovered during authentication, request/trace IDs for logs, and cancellation/deadline signals for downstream calls. It lets layers cooperate without passing dozens of independent parameters everywhere.

Context is not a replacement for explicit domain inputs. Use it for request lifecycle/cross-cutting metadata. Avoid turning it into a hidden bag of arbitrary business state; that creates invisible coupling and makes testing unclear.

## Timestamp map

- **00:00** — Why these three groups of concepts are covered together.
- **03:00** — Handler/controller responsibility and request/response objects.
- **10:00** — Deserialization/binding and validation at the handler boundary.
- **17:00** — Service layer and repository interaction.
- **25:00** — Controller response responsibilities.
- **30:00** — Middleware, `next`, and pipeline behavior.
- **40:00** — CORS, rate limiting, logging, and middleware examples.
- **50:00** — Middleware ordering and global error handling.
- **55:00** — Request context, identity, trace information, cancellation, and deadlines.

## Check yourself

If a database call fails, which layer should add business context, which should format the HTTP response, and where should the central error handler run?

## Study prompt from this lesson

Trace one POST request through your app. Mark every line as transport, cross-cutting concern, use case, persistence, or external dependency. If a line cannot be classified, decide whether it belongs in an explicit boundary or is accidental coupling.

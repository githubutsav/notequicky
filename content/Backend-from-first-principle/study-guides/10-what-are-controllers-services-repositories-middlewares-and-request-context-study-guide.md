# Study guide — 10. Controllers, services, repositories, middlewares, and request context

> This is added guidance, not a claim about the video's contents.

## A minimal boundary map

| Boundary | Owns | Avoids |
| --- | --- | --- |
| Controller/handler | HTTP parsing, response mapping | Core business policy |
| Service | Use cases and domain decisions | HTTP and SQL details |
| Repository | Persistence reads/writes | Business workflows |
| Middleware | Cross-cutting pipeline behavior | Per-route domain logic |
| Request context | Request-scoped metadata/cancellation | Hidden global state |

The point is not to create many files. Create a boundary only when it makes dependency direction and tests clearer.

## Production application architecture

### Dependency direction

Keep outward-facing technology details at the edges:

~~~text
HTTP / queue / CLI adapter
  → controller/handler
  → application service (use case)
  → repository / external-port interface
  → Postgres / email / payment implementation
~~~

The service should depend on an interface/capability it needs, not on a particular HTTP framework or database driver. This makes the use case testable and lets infrastructure evolve without rewriting business decisions.

### Transaction boundaries

Decide where a transaction begins and ends. Often the application service owns the transaction because it knows which changes must succeed together. Avoid a controller that opens a transaction, calls unrelated services, and then hides partial failure. Pass a request context/deadline into database and external calls so shutdown/timeouts can cancel work.

### Middleware hardening

- Limit request body size before parsing.
- Add correlation ID and panic/exception recovery early.
- Authenticate before calling protected use cases.
- Authorize against the resource inside or immediately before the use case.
- Apply rate limits with a key appropriate to the threat: IP, account, token, or route.
- Map errors once at the edge; do not return framework-specific errors from the service.

### Error taxonomy

Define typed/domain errors such as invalid input, not found, conflict, forbidden, unavailable dependency, timeout, and unexpected failure. The service adds business context; the controller/error mapper converts them into HTTP status and public error shape; logs/traces retain safe diagnostic context.

### Test plan

| Layer | High-value test |
| --- | --- |
| Service | business branch with fake repository/dependency |
| Repository | real database behavior, transaction/constraint/query test |
| Handler | HTTP binding, validation, status/error mapping |
| Middleware | authorization, correlation ID, timeout, error recovery |
| End-to-end | deployed request path and observable trace |

## Learn by building: split one use case by responsibility

When one route grows, do not move code into folders blindly. Split it where responsibilities differ. Create these small modules.

~~~ts
// src/repositories/product-repository.ts
export type Product = {
  id: string;
  name: string;
};

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
}

// src/services/get-product.ts
import type { ProductRepository } from "../repositories/product-repository.js";

export function buildGetProduct(repository: ProductRepository) {
  return async (id: string) => {
    return repository.findById(id);
  };
}
~~~

The repository owns persistence details. The service owns the use case. The route/controller only translates HTTP:

~~~ts
const getProduct = buildGetProduct(productRepository);

app.get("/products/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const product = await getProduct(id);

  if (!product) {
    return reply.code(404).send({ code: "PRODUCT_NOT_FOUND" });
  }

  return reply.send(product);
});
~~~

This separation makes tests cheaper. A service test can pass a fake repository without starting HTTP or PostgreSQL. A route test can focus on status codes and input. A database test can focus on SQL.

### Request context rule

Pass explicit context—such as request id, actor id, or tenant id—when an operation needs it. Do not reach into a global request variable from a repository. Explicit inputs show what a function depends on and prevent cross-request leaks.

## Read next

- [Express middleware guide](https://expressjs.com/en/guide/using-middleware.html)
- [Go `context` package](https://pkg.go.dev/context)
- [The Twelve-Factor App](https://12factor.net/)
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)

## Public repositories worth studying

- [go-chi/chi](https://github.com/go-chi/chi)
- [fastify/fastify](https://github.com/fastify/fastify)
- [nestjs/nest](https://github.com/nestjs/nest)
- [django/django](https://github.com/django/django)
- [bxcodec/go-clean-arch](https://github.com/bxcodec/go-clean-arch) — study the dependency direction, not a rigid folder recipe.

## Build exercise

Implement a `CreateOrder` use case with a handler, service, repository interface, authentication middleware, request ID, deadline, and global error mapper. Write a service test with a fake repository and a handler test with the real HTTP boundary.

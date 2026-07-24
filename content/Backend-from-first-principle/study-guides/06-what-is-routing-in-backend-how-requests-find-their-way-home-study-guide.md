# Study guide — 6. What is Routing in Backend? How Requests Find Their Way Home

> This is added guidance, not a claim about the video's contents.

## Route-design rules of thumb

- Use nouns for resources and methods for intent.
- Keep path segments stable and meaningful; use query parameters for optional filtering, sorting, search, and pagination.
- Treat a version change as a migration plan, not just a new URL.
- Put authorization close to the route boundary, but keep business rules in a service/domain layer.
- Define a consistent not-found response and do not leak route internals.

## Production route and list-contract patterns

### Build route contracts around stable resource identities

Use opaque IDs where possible. Do not assume a sequential database ID is safe to expose or that knowing an ID grants access. The route selects a candidate resource; authorization decides whether the caller may see or modify it.

### Pagination needs an operational policy

Choose a maximum page size. Decide whether offset/page pagination is sufficient or cursor pagination is needed for large/changing collections. Document the default sort order; without a stable order, clients can see duplicates or missing items between pages.

For example, a production list contract might be:

```text
GET /projects?limit=25&cursor=<opaque>&sort=created_at.desc
```

The response needs enough metadata for the client to fetch the next page, and the server must validate `limit`, cursor shape, allowed sort fields, and sort direction.

### Route matching is an attack and correctness boundary

- Validate path/query values after match.
- Normalize only when the contract permits it.
- Reject ambiguous paths and unbounded list queries.
- Avoid putting secrets in query strings because they can appear in logs, browser history, and proxy telemetry.
- Explicitly decide trailing-slash/case behavior to avoid duplicate cache or routing behavior.

### Versioning runbook

When a breaking change is unavoidable, publish the old/new contract, instrument per-version traffic and errors, communicate the deadline, and remove the old version only after real usage has ended. Versioned URLs are easy; supporting them operationally is the actual work.

## Learn by building: move a route into its own module

Once routes grow, keep the URL-to-handler mapping together. Create src/routes/products.ts:

~~~ts
import type { FastifyPluginAsync } from "fastify";

export const productRoutes: FastifyPluginAsync = async (app) => {
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    return reply.send({
      id,
      name: "Example product",
    });
  });
};
~~~

Register it in src/server.ts:

~~~ts
import { productRoutes } from "./routes/products.js";

app.register(productRoutes, {
  prefix: "/products",
});
~~~

Now this request reaches the handler:

~~~bash
curl -i http://localhost:3000/products/book-1
~~~

The prefix and local route compose into one path. The route module does not need to know whether the application is deployed behind a proxy, which database will be used, or how logging is configured. It owns only HTTP matching and request translation.

### Route design rule

Make the route say what it represents. Prefer a stable resource path such as /products/:id over a path that hides every action behind a vague verb. Use a separate service function when the handler begins to contain business decisions or infrastructure calls.

## Read next

- [MDN: URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [HTTP Semantics — RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [OpenAPI Paths and Operations](https://spec.openapis.org/oas/latest.html#paths-object)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md)

## Public repositories worth studying

- [expressjs/express](https://github.com/expressjs/express)
- [go-chi/chi](https://github.com/go-chi/chi)
- [gin-gonic/gin](https://github.com/gin-gonic/gin)
- [fastapi/fastapi](https://github.com/fastapi/fastapi)
- [nestjs/nest](https://github.com/nestjs/nest)

## Build exercise

Design and implement these routes for a library: list books, create book, get one book, list a user's loans, and search books. Add pagination and one versioned breaking change. Write tests that prove the correct handler is selected.

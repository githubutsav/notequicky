# Study guide — 11. Complete REST API Design

> This is added guidance, not a claim about the video's contents.

## Design from a contract first

Before implementation, write an OpenAPI document or a small contract table that defines:

- resource names and ownership boundaries;
- each operation's method, path, request schema, success status, and error cases;
- pagination/filter/sort semantics and limits;
- authorization policy; and
- deprecation/migration strategy for breaking changes.

Consistency matters more than finding a theoretically perfect URL.

## Production API design review

### Contract checklist

- Is the resource identity opaque and stable?
- Are write fields allow-listed rather than accepting every stored field?
- Is each list bounded, ordered, and filterable only through documented fields?
- Are error codes stable and safe for clients to act on?
- Does the authorization rule include tenant/object ownership?
- Does a retry create duplicate work? If so, where is the idempotency key?
- Is the contract documented in OpenAPI and checked in CI?

### List and pagination decisions

Use a stable ordering. Offset pagination can be simple for small/moderate datasets; cursor pagination is often better for large/changing collections. In either case, validate limits, cap them server-side, and define whether filters/sort are included in the cursor contract.

### Error design

Use a consistent problem/error document with a machine code, HTTP status, request/correlation ID, and field-level details only when safe. Do not make clients infer error type by parsing a human message. Log technical causes internally with the same correlation ID.

### Backward compatibility

Add optional fields rather than changing old fields’ meaning. Never remove/rename a public field without a migration plan. Version truly breaking changes and measure old-client usage before removal. Contract tests between consumers and providers catch accidental breakage earlier than a production incident.

### Operational behavior

Document timeouts, rate limits, caching, and asynchronous-work semantics. A client needs to know whether 202 Accepted means a job will complete later, how it checks status, and whether resubmission is safe.

## Learn by building: design one list endpoint completely

Build a list endpoint with an explicit query contract. This is more valuable than adding five CRUD routes quickly.

~~~ts
const listProjectsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

app.get("/projects", async (request, reply) => {
  const { limit, cursor } = listProjectsQuery.parse(request.query);

  const page = await projectRepository.list({
    limit,
    cursor,
  });

  return reply.send({
    data: page.items,
    nextCursor: page.nextCursor,
  });
});
~~~

The response contract should look like this:

~~~json
{
  "data": [
    { "id": "prj_1", "name": "Practice lab" }
  ],
  "nextCursor": "prj_1"
}
~~~

Why this shape is deliberate:

- data makes room for metadata without breaking clients later.
- limit is capped by the server, so a client cannot request an accidental million-row response.
- cursor is opaque to the client. Do not make clients parse database offsets or internal timestamps.
- a stable ordering is required before a cursor means anything.

### Test the contract

Write one HTTP test for an empty list, one for a limit over 50, and one that requests the second page after an insert. If clients will retry POST requests, add an idempotency-key policy before you publish the endpoint—not after duplicate records appear.

## Read next

- [HTTP Semantics — RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md)
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)

## Public repositories worth studying

- [OAI/OpenAPI-Specification](https://github.com/OAI/OpenAPI-Specification)
- [swagger-api/swagger-ui](https://github.com/swagger-api/swagger-ui)
- [stoplightio/spectral](https://github.com/stoplightio/spectral) — API style linting.
- [microsoft/api-guidelines](https://github.com/microsoft/api-guidelines)
- [zalando/restful-api-guidelines](https://github.com/zalando/restful-api-guidelines)

## Build exercise

Write OpenAPI for an organizations/projects service. Implement only `POST /organizations`, `GET /organizations/{id}`, and `GET /organizations?sort=&page=`. Validate the implementation with contract tests before adding more routes.

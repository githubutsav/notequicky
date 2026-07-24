# Study guide — 5. Understanding HTTP for backend engineers, where it all starts

> This is added guidance, not a claim about the video's contents.

## Learn HTTP by inspecting it

Use `curl -i`, your browser network panel, and an API client. Do not merely memorize status codes—make requests that demonstrate each behavior:

- a cacheable `GET` with an `ETag`;
- an invalid request with a useful `4xx` response;
- a preflighted cross-origin request;
- an upload with `multipart/form-data`;
- a compressed response.

## Production HTTP contract design

### Set the boundary explicitly

For every endpoint, document method, path, accepted content type, authentication rule, request schema, success status/body, expected failure statuses, cache behavior, and rate-limit behavior. Generate the implementation and client documentation from an OpenAPI contract when possible, but still manually review semantics.

### Treat timeouts and retries as part of HTTP behavior

A client timeout does not prove that the server did not complete work. For mutations, use an idempotency key when duplicate execution would be harmful. For read requests, set a bounded client timeout and retry only errors that make sense to retry. On the server, time out downstream calls, return a controlled response, and preserve trace/request IDs.

### Caching decision table

| Data type | Typical cache posture | Why |
| --- | --- | --- |
| public immutable asset | long cache lifetime + content hash | safe to reuse until URL changes |
| public catalog | short/validated cache | stale data may be tolerable |
| personalized response | private/no shared cache by default | avoid cross-user leakage |
| permission-sensitive data | no cache unless explicitly designed | permissions can change |
| mutation response | usually no implicit shared cache | state just changed |

### Edge hardening checklist

- Terminate TLS with current settings and redirect HTTP to HTTPS.
- Set a request-size limit before application allocation.
- Validate `Content-Type` before parsing a body.
- Configure CORS for known origins, methods, and headers—never use it as access control.
- Send security headers appropriate to your app; test them with real browser behavior.
- Log status, latency, request ID, route pattern, and upstream error without logging secrets.

## Practical test matrix

For each endpoint, test normal response, malformed body, unsupported content type, unauthorized/forbidden access, timeout, repeated request, cache revalidation, and proxy-forwarded behavior. Testing only controller success paths is not enough.

## Learn by building: make an HTTP contract visible

Add a route that uses the path, query string, headers, status code, and response body deliberately:

~~~ts
app.get("/greet/:name", async (request, reply) => {
  const params = request.params as { name: string };
  const query = request.query as { excited?: string };
  const language = request.headers["accept-language"] ?? "en";

  const punctuation = query.excited === "true" ? "!" : ".";

  reply.header("cache-control", "no-store");
  reply.header("content-language", language);

  return reply.code(200).send({
    message: "Hello, " + params.name + punctuation,
  });
});
~~~

Inspect the full response, not just the JSON:

~~~bash
curl -i "http://localhost:3000/greet/Utsav?excited=true" \
  -H "accept-language: en-IN"
~~~

Read the result as an HTTP message:

- GET is the method: it expresses a read.
- /greet/Utsav is the path: it identifies the requested resource/action.
- excited=true is a query value: optional request behaviour.
- accept-language is request metadata.
- 200 says the request succeeded.
- cache-control and content-language are response metadata.
- the JSON body is the representation returned to the caller.

### Failure experiment

Change the method to POST. A well-defined API should respond with method-not-allowed/not-found behaviour rather than silently treating every method as equivalent. Method semantics protect clients, caches, and operators from ambiguous APIs.

## Read next

- [MDN HTTP reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference)
- [HTTP Semantics — RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [HTTP Caching — RFC 9111](https://www.rfc-editor.org/rfc/rfc9111)
- [HTTP/2 — RFC 9113](https://www.rfc-editor.org/rfc/rfc9113)
- [HTTP/3 — RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)
- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

## Public repositories worth studying

- [curl/curl](https://github.com/curl/curl) — a mature HTTP client implementation.
- [httpie/cli](https://github.com/httpie/cli) — readable command-line HTTP requests.
- [nodejs/undici](https://github.com/nodejs/undici) — modern HTTP client internals for Node.js.
- [nginx/nginx](https://github.com/nginx/nginx) — HTTP server and proxy behavior.
- [microsoft/api-guidelines](https://github.com/microsoft/api-guidelines) — practical API semantics.

## Build exercise

Build `GET /articles/:id` with `ETag` support. Request it twice, then edit the article and prove that the response changes from `304` to `200` with a new entity tag.

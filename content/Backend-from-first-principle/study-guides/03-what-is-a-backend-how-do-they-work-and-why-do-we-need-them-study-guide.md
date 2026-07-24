# Study guide — 3. What is a Backend, how do they work and why do we need them?

> This is added guidance, not a claim about the video's contents.

## A useful mental model

Treat the backend as a boundary with four jobs: accept requests, enforce policy, perform domain work, and communicate with durable or external systems. Keep browsers untrusted; validate every request again on the server.

## Production architecture: from public request to application code

Use a layered edge intentionally:

```text
Internet
  → DNS
  → CDN/WAF/load balancer (when needed)
  → TLS-terminating reverse proxy
  → application instances
  → database/cache/queue/external services
```

### What each layer should own

- **DNS:** maps a public name to the service edge; use a low enough TTL to support controlled changes, not as a normal deployment mechanism.
- **Edge/proxy:** TLS, request-size limits, safe forwarding headers, basic rate limits, routing, and public access logs.
- **Application:** authentication, authorization, validation, use cases, business invariants, and domain audit events.
- **Data/dependencies:** durable state, cache/queue behavior, connection limits, transactions, and timeouts.

Do not put business decisions in NGINX configuration just because it can technically route a request. Do not put trust decisions in a browser just because it can hide a button. The layer that owns security/business truth must be server-side.

### Request forwarding rules you need in production

When a reverse proxy forwards a request, explicitly decide which headers are trusted. `X-Forwarded-For`, `X-Forwarded-Proto`, host headers, and client IP affect redirects, cookies, rate limits, audit logs, and security checks. Accept them only from known proxies; an arbitrary internet client can forge a header.

Set timeouts at both proxy and application layers. Without them, a slow client or dependency can occupy connections indefinitely. Also set a request-body size limit before an upload reaches application memory.

### Minimum observability at this boundary

Log a request ID at the proxy and preserve it in the application. Record status code, latency, route pattern (not only raw URL), request size, response size, and upstream error. This lets you distinguish “the app is down” from “DNS is wrong” or “the proxy cannot reach the app.”

## A production-ready mini deployment

1. Run a small service only on `127.0.0.1:3000`.
2. Put a reverse proxy on the public port.
3. Enable HTTPS and redirect HTTP to HTTPS.
4. Add `/livez` and `/readyz`; readiness should fail when the app cannot safely accept work.
5. Give every request a correlation ID.
6. Simulate a downstream timeout and make sure the proxy returns a controlled failure, not an endless hang.

## Learn by building: make the backend own a rule

The frontend can display a form, but the backend must make the authoritative decision. Add a tiny in-memory product lookup:

~~~ts
const products = [
  { id: "book-1", name: "Backend From First Principles", priceInPaise: 49900 },
];

app.get("/products/:id", async (request, reply) => {
  const params = request.params as { id: string };
  const product = products.find((item) => item.id === params.id);

  if (!product) {
    return reply.code(404).send({
      code: "PRODUCT_NOT_FOUND",
      message: "The requested product does not exist.",
    });
  }

  return reply.send(product);
});
~~~

Run these two requests:

~~~bash
curl -i http://localhost:3000/products/book-1
curl -i http://localhost:3000/products/unknown
~~~

This is a backend in miniature. It receives an HTTP request, translates a path value into input, applies a rule, chooses a status code, and returns a stable JSON shape. The in-memory array is only a temporary repository; a later database lesson will replace it without changing the HTTP contract.

### Why the price is an integer

The example uses paise rather than a floating-point number. A backend should represent money in a way that preserves exact business values. This is the kind of rule that belongs on the server even if a browser also validates it for user experience.

## Read next

- [MDN: How DNS works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name)
- [NGINX reverse proxy guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [PostgreSQL: connection behavior](https://www.postgresql.org/docs/current/connect-estab.html)

## Public repositories worth studying

- [nginx/nginx](https://github.com/nginx/nginx) — reverse-proxy and web-server source.
- [caddyserver/caddy](https://github.com/caddyserver/caddy) — automatic HTTPS and reverse proxying.
- [expressjs/express](https://github.com/expressjs/express) — minimal request handling in Node.js.
- [Unitech/pm2](https://github.com/Unitech/pm2) — Node.js process management.
- [porsager/postgres](https://github.com/porsager/postgres) — a concise PostgreSQL client to inspect after learning connection basics.

## Build exercise

Run a local application on port `3000`, put a reverse proxy in front of it, and log an `X-Request-ID` at both layers. Verify which headers reach the app.

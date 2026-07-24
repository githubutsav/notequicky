# Study guide — 8. Authentication and authorization for backend engineers

> This is added guidance, not a claim about the video's contents.

## A safer design sequence

1. Define identities, protected resources, and roles/permissions first.
2. Choose an authentication protocol based on the client and trust boundary.
3. Store passwords only with an adaptive password hash; never invent crypto.
4. Make authorization decisions server-side for every protected request.
5. Add rate limits, audit logs, token/session expiry, revocation strategy, and generic failure messages.

Treat JWTs as a token format, not a universal replacement for server-side state. Decide deliberately where logout, revocation, and changing permissions are enforced.

## Production identity architecture

### Start with an authorization matrix

Before selecting a library, list actor types, resources, actions, and ownership rules. For example:

| Actor | Project | Task | Billing |
| --- | --- | --- | --- |
| Member | read assigned projects | create/update own task | none |
| Project admin | manage project | manage project tasks | none |
| Organization owner | manage all organization projects | manage all tasks | manage billing |

This prevents the most common implementation mistake: checking only “is logged in” rather than “may this actor perform this action on this object in this tenant?”

### Session/cookie baseline for browser apps

Use a server-side session when you want straightforward revocation and changing permissions. Store only a high-entropy opaque identifier in the browser. Set appropriate cookie attributes (`Secure`, `HttpOnly`, and a deliberate `SameSite` policy), rotate the session after login/privilege changes, expire it, and invalidate it on logout or suspicious activity. Keep session state in a shared store when multiple app instances serve traffic.

### Password-handling baseline

Use a maintained adaptive password-hashing implementation such as Argon2id, bcrypt, or scrypt through a well-supported library; never invent a hash scheme. Enforce rate limits and credential-stuffing defenses. Log security events without logging passwords or raw tokens. Plan account recovery and MFA as product flows, not merely API endpoints.

### Token baseline for APIs

Use short access-token lifetimes and only issue refresh tokens when you have a secure rotation, revocation, and theft-detection plan. Verify issuer, audience, signature algorithm, expiration, and intended use. Never trust an unverified decoded token payload. Treat token claims as a cache of authorization facts unless your design proves they cannot become stale.

### OAuth/OIDC baseline

For public/browser clients, use an established library and the appropriate modern authorization-code flow with PKCE. Validate state/nonce where your chosen flow requires them. Register exact redirect URIs. Keep client secrets out of browser code. Request the smallest scopes and document why each scope is needed.

### Security test matrix

Test unknown-user/wrong-password response equivalence, expired/revoked token behavior, cross-tenant object access, privilege changes after login, missing/forged claims, CSRF on cookie-authenticated writes, session fixation, refresh-token reuse, and audit-log coverage.

## Learn by building: enforce authorization at the route boundary

Do not begin by writing a token implementation. First see the distinction between “who is this?” and “may they do this?” Create a small authentication hook that represents a verified identity:

~~~ts
type CurrentUser = {
  id: string;
  tenantId: string;
  role: "reader" | "admin";
};

declare module "fastify" {
  interface FastifyRequest {
    currentUser?: CurrentUser;
  }
}

app.addHook("preHandler", async (request) => {
  const role = request.headers["x-practice-role"];

  if (role === "reader" || role === "admin") {
    request.currentUser = {
      id: "practice-user",
      tenantId: "practice-tenant",
      role,
    };
  }
});

app.delete("/admin/products/:id", async (request, reply) => {
  if (request.currentUser?.role !== "admin") {
    return reply.code(403).send({
      code: "FORBIDDEN",
      message: "You are not allowed to delete products.",
    });
  }

  return reply.code(204).send();
});
~~~

Try both callers:

~~~bash
curl -i -X DELETE http://localhost:3000/admin/products/book-1 \
  -H "x-practice-role: reader"

curl -i -X DELETE http://localhost:3000/admin/products/book-1 \
  -H "x-practice-role: admin"
~~~

This is a learning-only identity source. A real service must establish currentUser from a verified session or access token, never from a caller-controlled role header. The authorization check, however, is real: the server decides based on trusted identity and the requested action.

### Next improvement

Add a product ownerId and require both an authenticated user and an ownership/role check. That is the transition from coarse role-based authorization to object-level authorization.

## Read next

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OAuth 2.0 — RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT — RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)

## Public repositories worth studying

- [keycloak/keycloak](https://github.com/keycloak/keycloak) — identity and access management.
- [ory/hydra](https://github.com/ory/hydra) — OAuth 2.0 / OpenID Connect server.
- [oauth2-proxy/oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy) — authentication-aware reverse proxy.
- [panva/openid-client](https://github.com/panva/openid-client) — OpenID Connect/OAuth client library.
- [supertokens/supertokens-core](https://github.com/supertokens/supertokens-core) — session and authentication infrastructure.

## Build exercise

Create a two-role app: `reader` and `admin`. Use a server-side session, protect an admin route, log authorization denials, return the same generic message for unknown user and wrong password, and add a test proving a reader cannot invoke the admin action.

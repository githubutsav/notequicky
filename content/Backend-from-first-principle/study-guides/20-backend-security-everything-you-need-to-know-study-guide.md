# Study guide — 20. Backend Security: Everything You Need to Know

> This is added guidance, not a claim about the video's contents.

## A security engineering routine

- Threat-model each feature before shipping: assets, trust boundaries, attacker goals, and abuse cases.
- Use safe APIs: parameterized database queries, schema validation, vetted password hashing, framework CSRF protection, and security-header middleware.
- Enforce authorization at every object boundary.
- Add rate limits, logging/audit trails, dependency patching, secret rotation, and regular security testing.
- Treat security failures as operational incidents: detect, contain, investigate, fix, and learn.

## Learn by building: enforce input and ownership in the data query

Take the authenticated actor from the earlier guide and use it in a parameterized query. The caller can name a project, but the database query also constrains access to that caller’s tenant:

~~~ts
export async function findProjectForTenant(
  projectId: string,
  tenantId: string,
) {
  const result = await pool.query(
    "SELECT id, name FROM projects WHERE id = $1 AND tenant_id = $2",
    [projectId, tenantId],
  );

  return result.rows[0] ?? null;
}
~~~

Then use one safe response for “not found or not accessible”:

~~~ts
const project = await findProjectForTenant(
  request.params.id,
  request.currentUser.tenantId,
);

if (!project) {
  return reply.code(404).send({
    code: "PROJECT_NOT_FOUND",
  });
}
~~~

This demonstrates two defences at once:

- $1 and $2 keep input values separate from SQL syntax.
- tenant_id is part of the actual lookup, so a forgotten route-level check is less likely to expose another tenant’s record.

### Security test

Insert one project for tenant A and one for tenant B. Authenticate as tenant A and request both ids. The first returns 200; the second must not return tenant B’s data. Keep this test permanently. Security regressions often arrive through “small” repository refactors.

## Read next

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [MDN web security](https://developer.mozilla.org/en-US/docs/Web/Security)

## Public repositories worth studying

- [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries)
- [OWASP/NodeGoat](https://github.com/OWASP/NodeGoat) — intentionally vulnerable learning application.
- [juice-shop/juice-shop](https://github.com/juice-shop/juice-shop) — intentionally insecure training app.
- [coreruleset/coreruleset](https://github.com/coreruleset/coreruleset) — OWASP Core Rule Set.
- [keycloak/keycloak](https://github.com/keycloak/keycloak)
- [OWASP/ASVS](https://github.com/OWASP/ASVS)

## Build exercise

Take a small API and perform a security review: validate every input, replace concatenated queries with parameter binding, add object-level authorization tests, set security headers, and write a rate-limit test for login. Keep the test cases as regression tests.

## Production security engineering

### Begin with a small threat model

For each service, list the assets worth protecting: accounts, tenant data, credentials, payments, admin actions, and availability. Then list the trust boundaries: browser to API, API to database, service to service, queue producer to worker, operator to admin endpoint. Ask what an untrusted caller can control at each boundary and what proof the service requires before an action is allowed.

Turn the result into invariants that can be tested:

- a caller can access only records authorized by server-side policy;
- untrusted input is parsed and validated before it reaches an interpreter or query builder;
- credentials are never stored or logged in plaintext;
- privileged actions are auditable; and
- a failure response does not reveal internal secrets or topology.

### Make authorization part of the data access path

Do not authorize only at a route name such as admin. Build resource-level checks into the service or repository query itself, for example by constraining a record lookup to the caller’s tenant and permitted scope. This makes a forgotten controller check less likely to become an object-level authorization flaw.

Use least-privilege service identities. A read-only reporting process should not share an administrator database credential with a mutation API. Rotate keys, constrain their scope, and make emergency revocation a rehearsed operation rather than an undocumented manual fix.

### Handle credentials and sessions defensively

Use a proven password hashing implementation with a modern adaptive algorithm and application-selected cost that is tested against your environment. Do not invent a password hash or compare secrets with ordinary timing-sensitive equality when a library provides a safe verifier. Keep reset tokens, refresh tokens, signing keys, and session identifiers out of logs and analytics.

For browser sessions, decide cookie flags, CSRF protection, origin policy, token expiry, and logout/revocation semantics as a single design. For machine clients, use short-lived scoped credentials and validate issuer, audience, expiry, and signature through a maintained library. Authentication success must still flow into per-action authorization.

### Use secure defaults throughout delivery

Parameterize queries, enforce request body and upload limits, use allow-list validation for structured values, set timeouts, and return generic internal-error responses. Apply rate limits to expensive and sensitive operations, with metrics that differentiate routine client mistakes from sustained abuse. Keep security headers and cross-origin settings under versioned configuration, then test the actual response headers in integration tests.

Add dependency scanning, secret scanning, code review for access-control changes, and a process for patching critical vulnerabilities. Log security-relevant events with safe identifiers, alert on meaningful anomalies, and preserve enough audit information to investigate an incident without collecting unnecessary personal data.

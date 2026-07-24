# 20. Backend Security: Everything You Need to Know

Video: [YouTube](https://www.youtube.com/watch?v=xB1C1xZZW4k&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=20)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Security is treated as a foundational backend concern. The video frames many vulnerabilities as confusion between data and code, then covers identity/session risks, authorization failures, browser-side attacks, and HTTP security controls.

## Key lessons from the video

- Injection attacks arise when input treated as data becomes part of an executable query/command language; parameterized/prepared queries are presented as a core mitigation for SQL injection.
- NoSQL/document-database code also needs strict input-shape control because user-controlled objects may introduce operators rather than ordinary values.
- The video recommends not building a full production authentication/authorization system from scratch when an appropriate specialist provider is available.
- Passwords must not be stored as plaintext; hashing and salting are discussed in relation to credential breaches and rainbow-table risk.
- Session cookies, JWTs, access/refresh-token lifetimes, rate limits, and account-level protections all require careful security design.
- Authorization must be checked on the requested object as well as at broad route/role levels; the video calls out broken object-level authorization risks.
- The browser-focused threats include XSS, CSRF, clickjacking, and insecure cookie/browser behavior. Content Security Policy and other security headers are described as defense layers, not substitutes for fixing the underlying bug.

## Timestamp map

- **00:00** — Security mindset and attack surfaces.
- **08:00–35:00** — Injection attacks, SQL injection, parameterized queries, and NoSQL input concerns.
- **50:00–75:00** — Authentication implementation, password hashing, and salts.
- **80:00–110:00** — Sessions, JWTs, access/refresh tokens, and authentication rate limiting.
- **119:00–135:00** — Object-level authorization and admin/access checks.
- **140:00–165:00** — XSS, CSRF, CSP, clickjacking, and security headers.

## Check yourself

For every endpoint that receives an object ID, can you prove the caller is allowed to act on *that particular object*, not merely that they are logged in?

## Detailed teaching notes from the video

### Security starts at every untrusted boundary

The video approaches backend security as a collection of boundaries where data controlled by someone else enters the system. One early theme is injection: untrusted input must remain data, not become part of executable query, command, or interpreter syntax. Parameterized database queries are presented as the normal defence because the database receives a query shape and values separately.

The discussion also raises the equivalent concern for document-style databases: if an API accepts arbitrary object structure where a simple value was expected, an attacker may influence the query semantics. The defensive lesson is to validate both type and shape at the boundary, not merely check that a field is present.

### Authentication does not grant unlimited authority

The video separates authentication from authorization. Authentication establishes who is making a request. Authorization decides whether that identity can perform this action on this particular resource. This becomes especially important for object identifiers in URLs and request bodies: a valid session alone does not mean that a caller may read, update, or delete every object they can name.

The lesson covers sessions and JWT-style tokens, including the distinction between shorter-lived access tokens and refresh tokens. It also connects login endpoints to rate limiting and account protection, because authentication is a high-value target for abuse even when the password storage itself is correct.

### Passwords and tokens need a lifecycle

The video explains why plaintext password storage is unacceptable and introduces hashing and salting as the appropriate direction for password protection. The backend verifies a password using the stored derived value rather than recovering the original secret. Tokens and sessions similarly need careful expiry, storage, and revocation decisions; they are credentials, not just convenient blobs of data.

### Browser-facing risks still matter to backends

The later part covers XSS, CSRF, CSP, clickjacking, and security headers. These concerns involve browser behavior, but the backend often decides the cookie properties, response headers, cross-origin policy, and HTML or API data that make the application safer or weaker.

The video presents these controls as layers. Content Security Policy and frame protections can reduce browser-side exposure; CSRF protections matter when credentials are automatically attached by the browser; careful output handling helps prevent untrusted data becoming executable content. No one header replaces authorization or input validation.

### A secure service is an ongoing process

Across the topics, the lesson’s production message is that security cannot be added as one final feature. Validate input, use safe database interfaces, authenticate correctly, authorize every resource action, protect credentials, limit abuse, and add browser/security headers as appropriate. Each control narrows a different failure path.

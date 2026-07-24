# 8. Authentication and authorization for backend engineers

Video: [YouTube](https://www.youtube.com/watch?v=A95rliroC8Q&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=8)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Authentication answers **who are you?** in a given context; authorization answers **what are you allowed to do?** The video traces the evolution of authentication, then introduces sessions, cookies, JWTs, OAuth 2.0, OpenID Connect, API keys, RBAC, and practical defenses.

## Key lessons from the video

- Authentication moved from possession and shared-secret mechanisms toward password hashing, multi-factor authentication, asymmetric cryptography, token systems, and newer passwordless approaches.
- HTTP's statelessness motivated session-based state: a server stores session context and the client sends a session identifier, commonly via a cookie.
- The video discusses JWTs and cookies as recurring authentication building blocks, and contrasts stateful and stateless approaches.
- OAuth 2.0 is presented for delegated third-party access; OpenID Connect adds an identity layer in that ecosystem.
- API keys are positioned for server-to-server or machine-to-machine use cases.
- Authorization is separate from identity. RBAC assigns permissions through roles, and a request can be allowed or rejected based on its user's role.
- Authentication failure messages should stay generic to avoid helping attackers enumerate users or passwords.
- Timing differences can leak information; constant-time comparison or response-time equalization can reduce that risk.

## Detailed teaching notes from the video

### Authentication and authorization answer different questions

The video's compact definition is worth memorizing:

```text
Authentication → Who are you in this context?
Authorization  → What may you do in this context?
```

Logging in successfully answers the first question. It does not automatically answer whether you may delete another user's data, see an invoice, or use an admin function. A robust backend performs both checks at the relevant points in a request.

### The history explains why modern mechanisms have layers

The video traces a path from social recognition and physical seals to shared passphrases, early computer passwords, hashing, asymmetric cryptography, multi-factor authentication, and modern identity protocols. The purpose is not a history exam. It shows why no single proof is universally enough: mechanisms need to scale, resist forgery, avoid secret disclosure, and work across many systems.

Passwords illustrate this evolution. A plaintext password file is catastrophic if exposed. Hashing avoids storing the original password, and salting prevents identical passwords from having the same stored hash value across users. MFA combines different kinds of proof such as something known, possessed, or inherent.

### Sessions give state to otherwise stateless HTTP

The video revisits HTTP statelessness. With a session model, after successful login the server creates a unique session identifier and stores relevant server-side context in a persistent store. The client carries the identifier—commonly in a cookie—on later requests. The server uses it to recover the session context.

This model makes server-side revocation and changing session state straightforward, but it also creates session storage, cookie, expiration, and distributed-system responsibilities. If a system has multiple application instances, they must share/coordinate the session store or use a design that does not depend on one instance's memory.

### JWTs and token lifetimes require a deliberate design

The video contrasts server-side session state with JWT-based stateless authentication. It discusses short-lived access tokens and longer-lived refresh tokens as a common pattern: the short access token is used for normal calls; a refresh mechanism obtains a new one after expiry. The key lesson is not “JWT everywhere.” It is to understand where identity/state is stored, how it expires, and how compromise/revocation is handled.

### OAuth 2.0 and OpenID Connect separate delegated access from identity

The video uses a note-taking app and Google as an example. A user is redirected to the authorization server, authenticates there, grants requested permissions, and the application receives an authorization code. The application exchanges the code for token material, then may call the resource server only within the granted permission scope.

OAuth 2.0 is about delegated authorization: one system obtains limited access to another system's resource on the user's behalf. OpenID Connect adds an identity layer, represented through ID-token claims in the described flow. Do not confuse “Sign in with Google” with copying a Google password into your app; the protocol exists to avoid that.

### Choose the mechanism by interaction, not fashion

The video gives practical categories: stateful authentication for common web-app workflows, stateless tokens for APIs/distributed systems, OAuth for third-party integrations/login providers, and API keys for machine-to-machine or single-purpose client access. These are starting points; every choice still needs expiration, rotation/revocation, transport protection, rate limits, and auditability.

### RBAC turns permissions into a manageable model

Authorization becomes necessary when not all users may perform the same actions. RBAC groups permissions into roles such as user, moderator, or admin. A request first establishes identity, then retrieves/derives its role/permissions, and later code allows or rejects the requested action. The video uses a `403 Forbidden` result when the actor is authenticated but lacks permission.

### Error messages and timing are part of the security design

Specific login messages such as “user not found” and “wrong password” can give an attacker information. The video recommends generic authentication-failure messages. It also describes timing attacks: a different amount of work for an unknown user versus a wrong password can leak which step failed. Constant-time comparison and response-time equalization reduce this signal.

## Timestamp map

- **00:00** — Authentication vs. authorization and historical context.
- **10:00** — Password storage, hashing, asymmetric cryptography, MFA, and modern authentication directions.
- **18:00** — HTTP statefulness, sessions, and cookies.
- **Around 30:00–70:00** — JWTs, OAuth 2.0, OpenID Connect, API keys, and choosing a mechanism.
- **80:00** — Authorization and RBAC.
- **88:00** — Generic error messages and timing-attack defenses.

## Check yourself

For an admin-only action, can you state separately how you establish identity, how you find permissions, and what response you send when either check fails?

## Study prompt from this lesson

For one protected endpoint, draw the full flow: login/credential proof, session/token creation, client storage/transmission, middleware validation, user lookup, object-level authorization, audit log, and denial response. Then identify what happens when the token is expired, revoked, stolen, or sent from another device.

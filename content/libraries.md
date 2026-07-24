# Full-Stack Libraries Learning Notes

This guide covers small, reusable libraries commonly used around a full-stack application. It deliberately does not teach Express/Fastify, WebSockets, React, or Next.js implementation; those belong in dedicated notes later.

Use a library when it solves a real problem better than a platform API. Fewer dependencies mean less upgrade, security, and operational work.

## 1. How to Choose a Library

Before installing a package, ask:

- Is there a built-in API that already solves this (`fetch`, `URL`, `crypto`, `node:test`)?
- Is the package maintained, documented, and compatible with the project runtime/module system?
- Does it run in Node, the browser, or both?
- Does it add runtime code, development tooling, native build requirements, or a security-sensitive responsibility?
- Can the team explain how it behaves when it fails?

```sh
npm view package-name version       # Read-only: latest published version
npm view package-name dependencies  # Read-only: direct dependencies
npm install package-name            # Changes dependencies: runtime package
npm install -D package-name         # Changes dependencies: development-only package
npm audit                            # Read-only: known vulnerability report
```

Commit the lockfile, review dependency changes, and update packages deliberately. `npm audit fix` can alter versions, so inspect its proposed change before using it.

## 2. Zod: Runtime Validation

TypeScript checks source code but disappears at runtime. Zod validates unknown runtime values—HTTP input, environment variables, form data, JSON, and third-party responses—and infers TypeScript types from the schema.

```sh
npm install zod # Changes dependencies: runtime validation library
```

```ts
import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

const result = createTodoSchema.safeParse(unknownRequestBody);
if (!result.success) {
  // Return a safe 400 response; log details carefully.
  throw new Error("Invalid todo input");
}

const input = result.data; // validated and typed
```

Use `parse` when invalid input should throw into an established error boundary. Use `safeParse` when your code needs to choose the error response. Validate at every external boundary before calling Prisma or business logic. Do not validate only in the frontend: clients can be bypassed.

### Validate Configuration at Startup

Environment values are strings or absent. Parse them once so the application fails fast instead of failing during a request.

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export const env = envSchema.parse(process.env);
```

Never log the resulting complete configuration object because it contains secrets. Zod is a runtime validator, not an authorization or sanitization substitute.

## 3. `bcrypt`: Password Hashing

`bcrypt` hashes passwords with a deliberately expensive, salted algorithm. Hashing is one-way: never encrypt passwords for later decryption and never store plaintext passwords.

```sh
npm install bcrypt # Changes dependencies: native Node password-hashing package
npm install -D @types/bcrypt # Changes dependencies: only if your setup needs declarations
```

```ts
import bcrypt from "bcrypt";

const cost = 12; // Benchmark on the production-like runtime; tune deliberately.

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, cost);
}

export async function passwordMatches(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
```

Use the asynchronous API on servers: synchronous hashing blocks the event loop. Store only the resulting hash; bcrypt includes the salt and cost in that hash. Compare the submitted password to the stored hash at login. Never return `passwordHash` in a Prisma `select` or API response.

`bcrypt` includes native code. If a deployment environment cannot build or use its prebuilt binary, `bcryptjs` is a pure-JavaScript alternative with different performance trade-offs. Choose one deliberately and keep the same algorithm for existing hashes until a planned migration.

## 4. `jsonwebtoken`: Signed Tokens

A JSON Web Token (JWT) is a signed compact token, not encrypted private storage. Anyone holding a typical JWT can read its payload; only a valid signature establishes that it was issued by the expected signer and was not modified.

```sh
npm install jsonwebtoken # Changes dependencies: JWT signing and verification
npm install -D @types/jsonwebtoken # Changes dependencies: only if your setup needs declarations
```

```ts
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "./env.js";

type AccessTokenPayload = {
  sub: string;
  role: "user" | "admin";
};

const accessTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(["user", "admin"]),
});

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
    issuer: "my-app",
    audience: "my-app-api",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: "my-app",
    audience: "my-app-api",
  });

  return accessTokenPayloadSchema.parse(decoded);
}
```

Use `verify`, not `decode`, for any trust decision. Explicitly restrict accepted algorithms and validate the claims and payload shape your application relies on. Keep access tokens short-lived; plan refresh-token storage, rotation, revocation, and key rotation before adopting long-lived sessions. Every protected operation must still authorize the verified user against the requested resource—having a valid JWT is authentication, not permission for every action.

Do not place passwords, secrets, or sensitive personal data inside a JWT. Avoid casually storing tokens in browser `localStorage`; token transport and CSRF/XSS trade-offs depend on the application’s chosen session design.

For Next.js App Router-specific auth, cookies, sessions, CSRF, OAuth, and authorization patterns, see [nextjs-auth.md](nextjs-auth.md).

## 5. `fetch` and Axios: HTTP Clients

Use built-in `fetch` for most modern browser and Node HTTP work. Consider Axios when its instance defaults, interceptors, request configuration, or project conventions provide a clear benefit.

```ts
const response = await fetch("https://api.example.com/todos", {
  signal: AbortSignal.timeout(5_000),
  headers: { Accept: "application/json" },
});

if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data: unknown = await response.json(); // still validate with Zod
```

`fetch` resolves for HTTP error status codes; always check `response.ok`. Set a timeout and cancellation strategy. Retry only transient, idempotent operations such as safe reads; blindly retrying a write can duplicate a payment, order, or mutation.

```sh
npm install axios # Changes dependencies: HTTP client
```

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5_000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  config.headers.set("X-Request-Id", crypto.randomUUID());
  return config;
});

export async function getTodos(): Promise<unknown> {
  try {
    return (await api.get("/todos")).data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Todo request failed: ${error.response?.status ?? "network"}`);
    }
    throw error;
  }
}
```

Create one configured Axios instance per API boundary rather than mutating global defaults. Do not log authorization headers or raw response bodies containing sensitive data. Eject dynamically added interceptors when appropriate to avoid leaks or duplicated behavior.

## 6. Production Security Middleware

These packages are usually mounted by a future server-framework note; learn their responsibilities now.

```sh
npm install helmet cors express-rate-limit # Changes dependencies: HTTP security middleware
```

- `helmet` configures security-related HTTP headers. Configure and test Content Security Policy rather than assuming defaults fit every frontend.
- `cors` controls which browser origins may read responses. It is not authentication or authorization; non-browser clients do not enforce it.
- `express-rate-limit` limits repeated requests in a single process. For multiple replicas, use a shared, production-appropriate store and define limits by endpoint and identity rather than only IP.

Rate limiting, request-size limits, timeouts, and secure cookie settings are complementary controls. They do not replace input validation, authentication, authorization, or monitoring.

## 7. `pino`: Structured Logging

Structured logs are easier to query and correlate than scattered `console.log` text. Use a request ID to connect logs for one operation and include safe contextual fields.

```sh
npm install pino # Changes dependencies: structured logger
```

```ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["password", "passwordHash", "authorization", "req.headers.authorization"],
});

logger.info({ requestId, userId }, "todo created");
logger.error({ err: error, requestId }, "database request failed");
```

Redaction is defense in depth, not permission to attach whole request bodies to logs. Send logs to a central system, retain them according to policy, and use metrics/tracing alongside logs for production observability.

## 8. Prisma and File Boundaries

Prisma is the database library in this project; see `Prisma.md` for schema, query, migration, and production detail. Validate input with Zod before Prisma, use narrow `select` clauses for public data, enforce ownership/tenant filters, and use transactions only when the operations must succeed together.

For uploaded files, use framework-specific multipart middleware in the future Express note. Regardless of library, enforce file-size limits, allowlisted types, content inspection where needed, generated storage names, authorization, malware scanning policy, and object storage rather than unrestricted local-disk production storage. Treat the MIME type supplied by the client as untrusted.

## 9. Small Utilities

Install utilities only when the built-in API would make the code less clear or less reliable.

```sh
npm install date-fns  # Changes dependencies: modular date helpers
npm install clsx      # Changes dependencies: conditional class-name utility
npm install lodash-es # Changes dependencies: tree-shakeable Lodash ESM utilities
```

### `date-fns`

Use it for readable formatting and date arithmetic. Store timestamps in UTC and format them for the user’s locale/time zone at the UI edge. Do not confuse a date-only business value with an instant in time.

```ts
import { format, addDays } from "date-fns";

format(addDays(new Date(), 7), "yyyy-MM-dd");
```

### `clsx`

Use it when conditional class strings would otherwise become noisy. It is frontend-oriented but does not require React.

```ts
import clsx from "clsx";

const className = clsx("button", disabled && "button--disabled");
```

### `lodash-es`

Use a named import for a capability that modern JavaScript does not offer cleanly. Do not import an entire utility library for simple `map`, `filter`, cloning, or debounce logic already covered in `javascript.md`.

```ts
import debounce from "lodash-es/debounce";

const saveDraft = debounce(() => void save(), 300);
```

## 10. Testing and Code Quality

Use one test runner consistently. Node has `node:test`; Vitest is a common TypeScript-friendly option. Use tests for validation schemas, password and token flows, authorization decisions, HTTP error handling, and database integration against a separate test database.

```sh
npm install -D vitest        # Changes dependencies: test runner
npm install -D eslint prettier # Changes dependencies: linting and formatting tools
```

Do not mock everything: mock external boundaries where necessary, but run integration tests against real infrastructure that matters, especially Prisma migrations and critical queries. A future Express note can cover framework-level HTTP testing.

## 11. Putting the Libraries Together in Production

```text
Request
  -> framework boundary (future express.md): request ID, size limit, CORS, headers, rate limit
  -> Zod: validate body, params, query, and configuration
  -> JWT: verify identity and required claims
  -> authorization: check ownership/role for this exact resource
  -> Prisma: narrow query or transaction against the database
  -> serializer: return only intended public fields
  -> Pino: safe structured event/error log with request ID
Response
```

### Registration

1. Zod validates email/password shape and normalization rules.
2. Check whether the account may be created; do not reveal more than necessary about existing accounts.
3. `bcrypt.hash` creates the password hash asynchronously.
4. Prisma stores the hash, never the plaintext password.
5. Return a safe public account shape and establish the chosen session mechanism.

### Login and Protected Data

1. Zod validates the submitted credentials.
2. Prisma retrieves the account’s ID and password hash only.
3. `bcrypt.compare` checks the submitted password against the stored hash.
4. `jsonwebtoken.sign` creates a short-lived access token only after successful login.
5. On later requests, `jsonwebtoken.verify` validates the token; authorization then verifies ownership or permission before Prisma reads or changes data.

For every path, add timeouts, normalized errors, safe logs, metrics, and tests. TypeScript types describe internal code; Zod establishes runtime data shape; JWT establishes identity; authorization makes the actual permission decision.

## 12. Production Checklist

- [ ] Lockfiles are committed; dependency updates, licenses, and advisories are reviewed.
- [ ] Environment variables are parsed at startup; secrets live in a secret manager or deployment configuration, not source control.
- [ ] Zod validates all external input before business logic or Prisma.
- [ ] Passwords use asynchronous bcrypt hashing; hashes and tokens never appear in responses or logs.
- [ ] JWT verification pins allowed algorithms and validates relevant claims; token expiry and rotation are designed.
- [ ] Every protected database operation applies authorization and ownership/tenant constraints.
- [ ] HTTP clients use timeouts, cancellation, safe retry policy, and response validation.
- [ ] Logs are structured and redacted; metrics, health checks, and error reporting are configured.
- [ ] CI runs validation, type-checking, linting, tests, Prisma migration checks, and production builds.
- [ ] Migrations run once as a controlled release step, not in every app process at startup.

## Resources

- [Zod documentation](https://zod.dev/): schemas, parsing, inference, and error handling.
- [bcrypt package documentation](https://www.npmjs.com/package/bcrypt): Node password hashing API.
- [jsonwebtoken package documentation](https://www.npmjs.com/package/jsonwebtoken): signing and verification API.
- [Axios documentation](https://axios-http.com/docs/intro): instances, errors, cancellation, and interceptors.
- [Prisma Learning Notes](Prisma.md): queries, migrations, and production database practices.
- [TypeScript Learning Notes](typescript.md): compile-time types and runtime-boundary guidance.
- [Commands and Keyboard Shortcuts](command.md): npm, Prisma, and project-quality commands.

## Application Repositories Worth Exploring

These are real products, not library source code. No repository is expected to use every package in this guide; study each for the production concern it demonstrates. Check its current `package.json` before assuming a particular dependency is still used.

| Repository | Why it is valuable | Start here |
| --- | --- | --- |
| [dubinc/dub](https://github.com/dubinc/dub) | Best first large-project reference: a TypeScript monorepo with Prisma, Redis, authentication, payments, email, analytics, deployment configuration, and security/contribution material. | `README.md` → `package.json` → `apps/web` → `packages` → `.github/workflows`. |
| [formbricks/formbricks](https://github.com/formbricks/formbricks) | Production survey platform that explicitly uses TypeScript, Next.js, Prisma, Zod, Vitest, Docker, and a monorepo structure. Strong for validation, database, tests, self-hosting, and API-contract study. | `README.md` → `apps` → `packages` → `openapi.yml` → Docker and test configuration. |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | Large scheduling product: TypeScript, Prisma, PostgreSQL, API design, integrations, background workflows, tests, Docker, and deployment concerns. | `README.md` → `.env.example` → `apps` → `packages` → `deploy` → test configuration. |
| [novuhq/novu](https://github.com/novuhq/novu) | Notification infrastructure with email, SMS, push, chat, in-app delivery, workflow concepts, and real-time concerns. Useful once you study queues and WebSockets. | `README.md` → architecture/docs → apps/packages → worker and provider code. |
| [prisma/prisma-examples](https://github.com/prisma/prisma-examples) | Small, runnable Prisma projects. Better than a large monorepo when learning one ORM pattern or deployment setup at a time. | Pick one example, read its schema, migrations, client setup, and tests end-to-end. |

### How to Learn From a Large Repository

```text
1. Read README, CONTRIBUTING, SECURITY, license, supported Node/package-manager versions.
2. Inspect package.json, lockfile, workspace config, scripts, and .env.example.
3. Trace one complete feature: request -> validation -> authentication -> authorization -> database -> response -> tests.
4. Read one migration, one background task, one error/logging path, and one CI workflow.
5. Use GitHub blame, pull requests, issues, and release notes to understand why a pattern exists.
```

Do not try to understand every folder at once or copy a large codebase into a beginner project. Start with one bounded flow, take notes, and reproduce the idea in a smaller app.

## Library Source Repositories

Read a repository in layers: start with its README, then its `package.json`, examples, tests, changelog/release notes, and issue tracker. Do not copy internal implementation patterns into an application just because a library uses them.

| Repository | Learn from it |
| --- | --- |
| [colinhacks/zod](https://github.com/colinhacks/zod) | Schema design, TypeScript inference, validation tests, and Zod release changes. |
| [kelektiv/node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js) | Native Node package structure and bcrypt API behavior. |
| [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | Signing/verification options, supported algorithms, and JWT API edge cases. |
| [axios/axios](https://github.com/axios/axios) | HTTP client configuration, adapters, errors, cancellation, and interceptors. |
| [pinojs/pino](https://github.com/pinojs/pino) | Structured logging, redaction, transports, and performance-oriented logging. |
| [helmetjs/helmet](https://github.com/helmetjs/helmet) | Security-header defaults and configuration cautions. |
| [express-rate-limit/express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate-limit policies, stores, headers, and distributed deployment concerns. |
| [prisma/prisma](https://github.com/prisma/prisma) | Prisma CLI/client releases, issues, examples, and migration behavior. |
| [date-fns/date-fns](https://github.com/date-fns/date-fns) | Modular date utilities and date-format tokens. |
| [lukeed/clsx](https://github.com/lukeed/clsx) | A deliberately small utility library and its test design. |
| [lodash/lodash](https://github.com/lodash/lodash) | Utility implementation details; prefer targeted ESM imports in applications. |
| [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Test-runner setup, mocking, coverage, and TypeScript tooling. |
| [eslint/eslint](https://github.com/eslint/eslint) and [prettier/prettier](https://github.com/prettier/prettier) | Linting/formatting configuration, release notes, and ecosystem conventions. |

Before depending on a repository, read its supported-runtime policy, security guidance, release notes, and open issues relevant to the feature you need. Pin through the lockfile and review dependency changes in pull requests.

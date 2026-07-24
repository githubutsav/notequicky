# Next.js Authentication and Authorization Notes

Authentication is not one feature. It is a chain of decisions:

```text
Authentication   Who is the user?
Session          How do requests remember that user?
Authorization    What may that user see or do?
CSRF/XSS         Can another site or script abuse that session?
Auditability     Can you explain sensitive access later?
```

Read [nextjs.md](nextjs.md) first for App Router basics. Read [libraries.md](libraries.md) for bcrypt, JWT, validation, and security libraries. Read [Prisma.md](Prisma.md) for database modeling and safe data access.

## 1. Mental Model

Auth in a Next.js App Router app usually touches these layers:

```text
Login/signup UI        collects credentials or starts OAuth
Server Function        validates input and starts auth flow
Auth provider/library  verifies identity
Session storage        cookie, JWT, database session, or provider session
Proxy                  early route gating and redirects
Server Components      read session and render protected pages
Server Functions       protect mutations
Route Handlers         protect API boundaries
Data Access Layer      final ownership, tenant, and role checks
```

The most important rule:

```text
Proxy can redirect early.
UI can hide buttons.
But final authorization must live next to the protected server operation.
```

Never trust a hidden button, disabled input, route group, layout, or Client Component check as authorization.

## 2. Library Or Custom Auth

Prefer a mature auth library for production unless you have a strong reason not to.

Use Auth.js, Clerk, Auth0, Stytch, Kinde, or similar when:

```text
OAuth/social login matters.
Email/passwordless login matters.
MFA or organization login may matter later.
Session rotation and provider edge cases matter.
You do not want to own every auth security detail.
```

Consider custom auth only when:

```text
The auth model is small and internal.
You fully understand cookie/session security.
You have time for testing, rate limiting, recovery, logging, and incident handling.
You can maintain it across framework upgrades.
```

For most serious apps, use an auth library and focus your custom code on authorization, data access, and product-specific permissions.

## 3. Auth.js App Router Shape

Auth.js is the common open-source choice for Next.js apps.

Common App Router shape:

```text
auth.ts
auth.config.ts
proxy.ts
app/api/auth/[...nextauth]/route.ts
app/login/page.tsx
app/actions/auth.ts
```

Typical setup commands:

```sh
# Changes dependencies: Auth.js/NextAuth package for Next.js
npm install next-auth@beta

# Generates a secret; do not commit the value
openssl rand -base64 32
```

Set the generated secret in local env files and in the production environment:

```text
AUTH_SECRET=replace-with-generated-secret
AUTH_URL=http://localhost:3000
```

Do not commit real secrets.

Minimal Auth.js shape:

```ts
// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
});
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

```ts
// proxy.ts
export { auth as proxy } from "@/auth";
```

For real apps, split provider config, custom pages, callbacks, and Edge-incompatible database code carefully. Do not import bcrypt, Prisma Client, or Node-only code into Proxy code unless the runtime supports it.

## 4. Cookies In Next.js

Next.js `cookies()` is async in modern App Router code.

Read cookies in Server Components:

```ts
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;

  return <p>{theme}</p>;
}
```

Set cookies only where response headers can still be modified:

```text
Server Functions
Route Handlers
Proxy
```

Cookie session options:

```text
httpOnly   prevents client JavaScript from reading the cookie
secure     sends cookie over HTTPS only
sameSite   helps control cross-site sending
expires    absolute expiration
maxAge     relative expiration in seconds
path       route scope
```

Example:

```ts
"use server";

import { cookies } from "next/headers";

export async function createSessionCookie(value: string, expires: Date) {
  const cookieStore = await cookies();

  cookieStore.set("session", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}
```

Delete on logout:

```ts
"use server";

import { cookies } from "next/headers";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
```

Important:

```text
Do not store session secrets in localStorage.
Do not store password hashes or private provider tokens in client-readable cookies.
Do not set cookies from Server Component rendering.
Use server-only helpers for session parsing.
```

## 5. Session Strategies

Common session strategies:

```text
Database session      cookie stores opaque session ID, database stores session
Encrypted JWT cookie  cookie stores encrypted/signed session payload
Provider session      managed by Clerk/Auth0/Stytch/etc.
Access/refresh token  common for API architectures, more moving parts
```

Database session:

```text
Pros     revocable, auditable, smaller cookie, easier forced logout
Cons     database lookup, session table, more infrastructure
Best     SaaS apps, teams, admin, permissions, enterprise
```

JWT cookie session:

```text
Pros     fewer database reads, simple deployment
Cons     revocation and stale permissions are harder
Best     small apps, short sessions, low-risk auth
```

Do not put sensitive personal data, access tokens, password hashes, or large authorization payloads into JWT/session cookies.

## 6. Login With Credentials

Credentials login means you own password security.

Minimum responsibilities:

```text
Validate input on server.
Rate-limit login attempts.
Store password hashes, never plaintext passwords.
Use async password comparison.
Return generic invalid-credentials errors.
Create session only after successful verification.
Log safely without passwords.
```

Install typical dependencies:

```sh
# Changes dependencies: validation and password hashing
npm install zod bcrypt

# Changes dev dependencies: bcrypt types if needed
npm install -D @types/bcrypt
```

Password verification sketch:

```ts
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
});

export async function verifyLogin(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Invalid email or password." };
  }

  const user = await getUserForLogin(parsed.data.email);
  if (!user) {
    return { ok: false, message: "Invalid email or password." };
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) {
    return { ok: false, message: "Invalid email or password." };
  }

  return { ok: true, userId: user.id };
}
```

Use the same error for missing user and wrong password. Different errors help attackers enumerate accounts.

## 7. OAuth Login

OAuth delegates identity verification to a provider such as GitHub, Google, or Microsoft.

OAuth still needs product decisions:

```text
Which providers are allowed?
Can users link multiple providers?
Can a provider email be trusted?
What happens when email is missing or unverified?
Can users change primary email?
What domains are allowed for a workspace?
How are duplicate accounts merged?
```

Auth.js provider sketch:

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
});
```

Environment variables are provider-specific:

```text
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

Never expose provider client secrets with `NEXT_PUBLIC_`.

## 8. Authorization

Authentication says who the user is. Authorization says what they may do.

Authorization belongs in server-side code:

```text
Server Components for protected reads
Server Functions for mutations
Route Handlers for API requests
Data Access Layer for ownership and role constraints
```

Good authorization checks:

```text
User owns this resource.
User belongs to this workspace.
User has required role.
Workspace subscription permits this action.
Resource is not archived/locked.
Mutation is allowed in current state.
```

Bad authorization checks:

```text
Button is hidden, so action is safe.
Route is behind Proxy, so mutation is safe.
User has a valid JWT, so they can access all records.
Client sent userId, so use that userId.
```

Prefer checking ownership in the database query:

```ts
export async function getProjectForUser(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId },
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}
```

For mutations:

```ts
export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId, role: "OWNER" } },
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Not found or not allowed");
  }

  await prisma.project.delete({ where: { id: project.id } });
}
```

Returning "not found" for unauthorized resources can avoid leaking whether a resource exists.

## 9. Data Access Layer And DTOs

Create a server-only data layer for protected data.

```text
app/
  lib/
    auth.ts
    session.ts
    data/
      projects.ts
      users.ts
```

Rules:

```text
Data functions receive the current user/session or read it server-side.
Data functions apply ownership/tenant filters.
Data functions return DTOs, not raw database rows.
DTOs exclude passwordHash, tokens, secrets, private metadata, and admin-only fields.
Client Components never import server-only data modules.
```

Example DTO:

```ts
import "server-only";

export async function getCurrentUserDTO() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return user;
}
```

Use `server-only` to catch accidental imports into client bundles.

## 10. Protecting Pages

Page-level protection usually happens in Server Components:

```tsx
import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <main>Dashboard</main>;
}
```

Use Proxy for early route gating:

```ts
// proxy.ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

Proxy should be quick and coarse. Do detailed authorization closer to data.

## 11. Protecting Server Functions

Server Functions can be called directly. Always protect them.

Pattern:

```text
Authenticate.
Validate input.
Authorize ownership/role.
Perform mutation.
Return safe result or redirect.
Revalidate affected routes/tags when needed.
```

Example:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
});

export async function updateProject(_state: unknown, formData: FormData) {
  const session = await requireSession();

  const parsed = updateProjectSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Check the form fields." };
  }

  await updateProjectForUser(parsed.data, session.userId);

  revalidatePath(`/projects/${parsed.data.id}`);
  return { ok: true };
}
```

Do not accept `userId` from form data for ownership. Use the session.

## 12. Protecting Route Handlers

Route Handlers are external boundaries. Treat request data as untrusted.

```ts
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2).max(80),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const project = await createProjectForUser(body.data, session.userId);

  return NextResponse.json({ project }, { status: 201 });
}
```

Use status codes deliberately:

```text
400 invalid request shape
401 unauthenticated
403 authenticated but not allowed
404 resource not found or hidden
409 conflict/stale state
429 rate limited
```

## 13. CSRF

CSRF matters when browsers automatically attach cookies to state-changing requests.

Mitigations:

```text
SameSite cookies
CSRF tokens
Origin/Referer checks
Fetch Metadata headers
Custom headers for API clients
User interaction for high-risk operations
```

SameSite is useful defense-in-depth, not a full auth design.

Practical guidance:

```text
Use SameSite=Lax for most app session cookies unless a flow requires otherwise.
Use SameSite=Strict for highly sensitive apps when cross-site navigation login behavior is acceptable.
Use SameSite=None only with Secure and only when cross-site cookies are required.
Add CSRF token or origin checks for cookie-authenticated unsafe requests when needed.
Use typed confirmation or re-auth for highly sensitive operations.
```

Unsafe methods:

```text
POST
PUT
PATCH
DELETE
```

Do not treat CORS as CSRF protection. CORS controls whether browser JavaScript can read responses; it does not stop a browser from sending a cookie-backed request.

## 14. XSS And Session Storage

XSS can steal tokens, perform actions as the user, or alter UI.

Safer defaults:

```text
Use HttpOnly cookies for sessions.
Avoid localStorage for high-value tokens.
Render user content as text by default.
Sanitize trusted rich text before rendering.
Avoid dangerouslySetInnerHTML.
Use Content Security Policy when the app is mature enough to configure it correctly.
```

HttpOnly cookies reduce token theft through JavaScript, but they do not stop injected JavaScript from making same-site requests as the user. You still need output safety, CSP, dependency hygiene, and authorization.

## 15. Password Reset And Email Verification

Password reset and verification tokens are security-sensitive.

Rules:

```text
Use random high-entropy tokens.
Store only a hash of reset tokens if you own the flow.
Set short expiration.
Use single-use tokens.
Return generic responses.
Rate-limit requests.
Invalidate old sessions after password change when appropriate.
Log safely.
```

Generic response:

```text
If an account exists, we sent reset instructions.
```

Do not reveal whether an email exists.

## 16. Multi-Tenant And Role-Based Apps

SaaS apps often need workspace or organization authorization.

Model the relationship explicitly:

```text
User
Workspace
Membership
Role
Permission
Resource
```

Membership example:

```text
OWNER    billing, delete workspace, manage members
ADMIN    manage project settings and members
MEMBER   create and edit normal records
VIEWER   read-only
```

Rules:

```text
Every protected query includes workspace/tenant scope.
Never trust workspaceId from the client without checking membership.
Use least privilege.
Keep billing/admin actions separate from normal member actions.
Audit high-risk actions.
```

## 17. Rate Limiting And Abuse Protection

Rate-limit sensitive operations:

```text
login
signup
password reset
email verification
MFA challenge
invite sending
expensive mutations
file uploads
```

Limit by more than IP when possible:

```text
IP
email
account ID
workspace ID
session ID
device/browser fingerprint only with care
```

Rate limiting does not replace password hashing, CSRF protection, authorization, or monitoring.

## 18. Testing Auth

High-value tests:

```text
Unauthenticated users are redirected from protected pages.
Authenticated users can access their own data.
Authenticated users cannot access another user's data.
Invalid login shows a generic error.
Logout clears the session.
Server Functions reject unauthenticated calls.
Server Functions reject wrong-owner calls.
Route Handlers return 401/403/404 correctly.
CSRF/origin protections reject bad unsafe requests when implemented.
Session expiry behaves correctly.
```

Use Playwright for login/logout and redirect flows. Use unit/integration tests for authorization helpers and data access functions. See [frontend-testing.md](frontend-testing.md).

## 19. Common Mistakes

### Confusing Auth With Authorization

A valid session is not permission to access every row.

### Trusting Client User IDs

Never use `userId` from form data, query params, or JSON body as the acting user. Read the session on the server.

### Putting Secrets In Client Code

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Importing Server Code Into Client Components

Keep Prisma, bcrypt, provider secrets, and token logic server-only.

### Overusing Proxy

Proxy is useful for early redirects. It is not the final authorization layer.

### Returning Sensitive Fields

Use DTOs and `select`. Never return `passwordHash`, provider refresh tokens, reset tokens, private keys, or internal security flags.

### Skipping Rate Limits

Login and password reset endpoints are abuse magnets.

## 20. Production Checklist

```text
Auth library or custom session design is chosen deliberately.
AUTH_SECRET and provider secrets are set outside source control.
Session cookies are HttpOnly, Secure in production, SameSite, and scoped.
Logout clears or invalidates the session.
Passwords are hashed with an appropriate async algorithm.
Login, signup, reset, and verification flows are rate-limited.
All Server Functions authenticate and authorize.
All Route Handlers authenticate and authorize.
Protected queries include ownership/tenant filters.
DTOs exclude sensitive fields.
CSRF mitigations match the cookie/session design.
XSS risks are reviewed for user-generated content.
Audit logs exist for high-risk actions.
Tests cover redirects, wrong-owner access, logout, and sensitive mutations.
Production monitoring avoids logging passwords, tokens, cookies, or secrets.
```

## 21. Commands To Remember

```sh
# Auth.js for Next.js App Router: changes dependencies
npm install next-auth@beta

# Generate AUTH_SECRET; do not commit the value
openssl rand -base64 32

# Validation and password hashing: changes dependencies
npm install zod bcrypt

# bcrypt TypeScript declarations when needed: changes dev dependencies
npm install -D @types/bcrypt

# Custom encrypted/signed sessions: changes dependencies
npm install jose

# Prisma adapter for Auth.js when using database-backed auth: changes dependencies
npm install @auth/prisma-adapter
```

## 22. Practice Tasks

1. Build a protected `/dashboard` page that redirects unauthenticated users.
2. Add login form validation with generic invalid-credentials errors.
3. Add logout that clears the session.
4. Protect a Server Function from unauthenticated users.
5. Protect a Server Function from wrong-owner users.
6. Add a membership table and authorize project reads through membership.
7. Add a Route Handler that returns 401, 400, 403, and 201 in the right cases.
8. Add Playwright coverage for login, logout, and protected redirects.
9. Add tests proving one user cannot read or mutate another user's resource.
10. Write a production auth checklist for your own app.

## Quick Reference

```text
Use library first       Auth.js, Clerk, Auth0, Stytch, Kinde
Cookie API             await cookies()
Set cookies            Server Functions or Route Handlers
Early route gate       Proxy
Final protection       Server Function, Route Handler, Data Access Layer
Session cookie         HttpOnly, Secure, SameSite, expires/maxAge, path
Password storage       hash only, never plaintext
CSRF                   relevant for cookie-authenticated unsafe requests
XSS                    avoid client-readable high-value tokens
DTO                    return safe public shape only
Authorization          ownership, tenant, role, resource state
```

## Resources

- Next.js authentication guide: https://nextjs.org/docs/app/guides/authentication
- Next.js cookies API: https://nextjs.org/docs/app/api-reference/functions/cookies
- Next.js Route Handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route
- Next.js Learn authentication chapter: https://nextjs.org/learn/dashboard-app/adding-authentication
- Auth.js: https://authjs.dev/
- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

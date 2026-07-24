# Next.js Learning Notes

Next.js is a React framework for building web applications with file-system routing, server rendering, data fetching, streaming, metadata, images, backend endpoints, and production deployment conventions.

```text
React gives components.
Next.js gives the application structure around those components.
```

These notes assume the modern App Router, TypeScript, React 19-era features, and Next.js 16.x. On July 19, 2026, the official docs showed Next.js `16.2.10` as the latest version. Check the docs before relying on version-sensitive caching, upgrade, or routing behavior.

Read [react.md](react.md) first if components, props, state, effects, or Hooks still feel shaky.

## 1. Setup and Mental Model

Create a new project:

```sh
npx create-next-app@latest my-next-app --yes
cd my-next-app
npm run dev
```

Open:

```text
http://localhost:3000
```

Current official requirements include Node.js `20.9+`. The recommended defaults include TypeScript, ESLint, Tailwind CSS, App Router, Turbopack, and the `@/*` import alias.

Useful scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

Mental model:

```text
app/ folders         -> URL routes
page.tsx            -> unique UI for a route
layout.tsx          -> shared UI around child routes
Server Component    -> default; runs on the server
Client Component    -> opt in with "use client"; runs in the browser
Server Function     -> async server function marked with "use server"
Route Handler       -> HTTP endpoint using Request and Response
```

Use Next.js when your app needs routing, layouts, server rendering, SEO, metadata, backend-for-frontend endpoints, form mutations, auth/session boundaries, deployment conventions, or performance features beyond a plain Vite React app.

## 2. Project Structure

A typical App Router project:

```text
app/
  layout.tsx
  page.tsx
  globals.css
  dashboard/
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
  api/
    health/
      route.ts
components/
lib/
public/
next.config.ts
package.json
tsconfig.json
.env.local
```

Important folders and files:

```text
app/                App Router routes and route-specific files.
public/             Static files served from the root path.
components/         Shared UI components.
lib/                Data access, auth helpers, validation, utilities.
next.config.ts      Next.js configuration.
proxy.ts            Request-boundary logic before routes render.
instrumentation.ts  Observability and instrumentation setup.
.env.local          Local secrets; do not commit.
```

Routes are public only when a route segment contains `page.tsx` or `route.ts`.

```text
app/page.tsx                    -> /
app/blog/page.tsx               -> /blog
app/blog/[slug]/page.tsx        -> /blog/my-post
app/shop/[...slug]/page.tsx     -> /shop/a/b/c
app/(marketing)/about/page.tsx  -> /about
```

Route groups such as `(marketing)` organize routes without adding to the URL. Private folders such as `_components` colocate files that should not become routes.

## 3. Layouts, Pages, and Navigation

The root layout is required and must render `<html>` and `<body>`.

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A small Next.js practice app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

A page defines route-specific UI.

```tsx
// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Todos</h1>
      <Link href="/dashboard">Open dashboard</Link>
    </main>
  );
}
```

Dynamic route params and search params are promises in modern App Router page props:

```tsx
// app/blog/[slug]/page.tsx
type BlogPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  return (
    <main>
      <h1>{slug}</h1>
      {preview === "true" && <p>Preview mode</p>}
    </main>
  );
}
```

Use `Link` for normal navigation. Use `redirect`, `notFound`, and navigation hooks only when the use case needs them.

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <h1>Welcome back</h1>;
}
```

Client navigation hooks such as `useRouter`, `usePathname`, and `useSearchParams` require a Client Component.

```tsx
// app/components/search-box.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/products?query=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submitSearch}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <button type="submit">Search</button>
    </form>
  );
}
```

## 4. Server and Client Components

In the App Router, components are Server Components by default.

Server Components can:

```text
Fetch data directly.
Read server-only environment variables.
Use database clients and backend SDKs.
Keep secrets out of the browser bundle.
Return JSX to be streamed to the client.
```

Server Components cannot:

```text
Use useState, useEffect, or event handlers.
Read window, document, localStorage, or browser-only APIs.
Depend on user interaction inside the component itself.
```

Client Components are marked with `"use client"` at the top of the file.

```tsx
// app/components/counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Good boundary:

```text
Server page fetches data
  -> passes safe props to small Client Component
  -> Client Component handles state, events, browser APIs
```

Avoid adding `"use client"` to large route trees unless the whole tree truly needs browser interactivity. Every Client Component boundary can pull more JavaScript into the browser bundle.

## 5. Fetching Data

Fetch data as close as possible to the route or component that needs it.

```tsx
// app/posts/page.tsx
type Post = {
  id: string;
  title: string;
};

export default async function PostsPage() {
  const response = await fetch("https://api.vercel.app/blog");

  if (!response.ok) {
    return <p>Could not load posts.</p>;
  }

  const posts = (await response.json()) as Post[];

  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

For database work, use a server-only helper or data access layer.

```tsx
// app/todos/page.tsx
import { getCurrentUserTodos } from "@/lib/todos";

export default async function TodosPage() {
  const todos = await getCurrentUserTodos();

  return (
    <main>
      <h1>Your todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

```ts
// lib/todos.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getCurrentUserTodos() {
  const session = await getSession();

  if (!session) {
    return [];
  }

  return prisma.todo.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      done: true,
    },
    orderBy: { time: "desc" },
  });
}
```

Security note:

- Server Components keep server code out of the client bundle, but they do not automatically make data safe.
- Authorize every query.
- Return minimal public fields.
- Treat all params, search params, form data, cookies, headers, and JSON bodies as untrusted.

## 6. Streaming, Loading, and Suspense

If a route waits on slow data, the user may wait too. Use `loading.tsx` for route-level loading UI.

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading dashboard...</p>;
}
```

Use `<Suspense>` for more granular streaming.

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";
import { RecentTodos } from "@/app/dashboard/recent-todos";
import { TodoSkeleton } from "@/app/dashboard/todo-skeleton";

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<TodoSkeleton />}>
        <RecentTodos />
      </Suspense>
    </main>
  );
}
```

A useful loading state looks like the shape of the real UI. Prefer skeletons or stable placeholders over layout-shifting spinners for important screens.

## 7. Caching and Revalidation

Caching changed across Next.js versions. In current Next.js 16 App Router docs, `fetch` requests are not cached by default. Cache deliberately, and check the installed version's docs before copying older examples.

With Cache Components enabled:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

Cache data inside a server-only function:

```ts
// lib/products.ts
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getProducts() {
  "use cache";

  cacheLife("hours");
  cacheTag("products");

  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
    },
  });
}
```

After a mutation, revalidate the affected route or tag.

```ts
// app/admin/products/actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProductName(id: string, name: string) {
  const session = await getSession();

  if (!session?.user.isAdmin) {
    throw new Error("Unauthorized");
  }

  await prisma.product.update({
    where: { id },
    data: { name },
  });

  revalidateTag("products", "max");
}
```

Older or non-Cache-Components projects may use the previous caching model:

```ts
await fetch("https://api.example.com/products", {
  cache: "force-cache",
});

await fetch("https://api.example.com/products", {
  next: { revalidate: 3600 },
});

await fetch("https://api.example.com/private", {
  cache: "no-store",
});
```

Caching checklist:

```text
Can this data be shared between users?
How fresh must it be?
What mutation invalidates it?
Is the cache key affected by params, cookies, headers, auth, or locale?
Does stale data create a security or correctness problem?
```

Never cache private user data as if it were public content.

## 8. Mutations and Server Functions

Use Server Functions for form submissions and mutations. In action contexts, they are often called Server Actions.

```ts
// app/todos/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export type CreateTodoState = {
  message: string;
};

export async function createTodo(
  _previousState: CreateTodoState,
  formData: FormData,
): Promise<CreateTodoState> {
  const session = await getSession();

  if (!session) {
    return { message: "Please sign in again." };
  }

  const parsed = createTodoSchema.safeParse({
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { message: "Enter a todo title." };
  }

  await prisma.todo.create({
    data: {
      title: parsed.data.title,
      done: false,
      userId: session.user.id,
    },
  });

  revalidatePath("/todos");
  return { message: "Todo created." };
}
```

Use the action from a Client Component when you need pending/error UI.

```tsx
// app/todos/todo-form.tsx
"use client";

import { useActionState } from "react";
import { createTodo, type CreateTodoState } from "@/app/todos/actions";

const initialState: CreateTodoState = {
  message: "",
};

export function TodoForm() {
  const [state, formAction, pending] = useActionState(
    createTodo,
    initialState,
  );

  return (
    <form action={formAction}>
      <label htmlFor="title">Todo</label>
      <input id="title" name="title" required />
      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
      {state.message && <p aria-live="polite">{state.message}</p>}
    </form>
  );
}
```

Server Function safety rules:

```text
Authenticate inside the function.
Authorize ownership or role before changing data.
Validate all form data with runtime validation.
Return expected validation errors as values.
Log unexpected failures safely on the server.
Revalidate affected paths or tags after successful mutation.
Do not pass secrets or raw database records back to Client Components.
```

Server Functions can be called by direct POST requests. Do not trust that only your UI will call them.

## 9. Route Handlers

Route Handlers create HTTP endpoints inside the `app` directory.

```ts
// app/api/health/route.ts
export function GET() {
  return Response.json({ ok: true });
}
```

Use Route Handlers for:

```text
Public APIs.
Webhooks.
Mobile app endpoints.
Third-party callbacks.
File upload boundaries.
Client Components that need server-only secrets.
```

Do not call a Route Handler from a Server Component just to fetch your own database data. Server Components already run on the server, so use a server-only function or data access layer directly.

Example POST endpoint:

```ts
// app/api/todos/route.ts
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json: unknown = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: {
      title: parsed.data.title,
      done: false,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      done: true,
    },
  });

  return Response.json({ todo }, { status: 201 });
}
```

Route Handlers support `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`. `route.ts` and `page.tsx` cannot live at the same route segment level.

## 10. Environment Variables and Configuration

Next.js loads `.env*` files into `process.env`.

```text
.env.local       local secrets, not committed
.env.development development-only values
.env.production  production values, usually managed by the host
```

Only variables prefixed with `NEXT_PUBLIC_` are bundled for browser code.

```text
DATABASE_URL=postgresql://...
AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=https://example.com
```

Rules:

```text
Never commit real secrets.
Never expose server secrets with NEXT_PUBLIC_.
Validate required env vars at startup.
Use @next/env when a separate tool, ORM config, or test runner must load .env files.
Use different secrets and database URLs for development, test, staging, and production.
```

Minimal validation:

```ts
// lib/env.ts
import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

Import server-only env helpers only from Server Components, Server Functions, Route Handlers, or other server-only files.

## 11. Prisma in Next.js

Keep Prisma on the server.

```ts
// lib/prisma.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Use Prisma from:

```text
Server Components
Server Functions
Route Handlers
server-only data access files
scripts and seed files
```

Do not use Prisma from:

```text
Client Components
browser event handlers
code imported by Client Components
```

Production habits:

```text
Use npx prisma migrate deploy in release/deploy steps.
Run migrations once, not from every app replica at startup.
Use select to return only public fields.
Check authorization in the same query when possible.
Avoid long transactions around network calls.
Set connection limits appropriate for your deployment platform.
```

Read [Prisma.md](Prisma.md) for migrations, relations, transactions, and production database checks.

## 12. Auth, Cookies, and Security

Authentication proves who the user is. Authorization checks what that user may do.

In Next.js, auth checks can appear in several places:

```text
Proxy              early redirects and coarse route gating
Server Components  page-level reads and redirects
Server Functions   mutation protection
Route Handlers     API/webhook protection
Data Access Layer  final ownership and role checks
```

Use Proxy for request-boundary work such as redirects, coarse access checks, logging, or headers.

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

Proxy is not your only authorization layer. Always re-check permissions in the Server Function, Route Handler, or data access function that reads or writes protected data.

Cookie habits:

```text
Use HttpOnly cookies for session tokens.
Use Secure in production.
Use SameSite deliberately.
Avoid storing high-value tokens in localStorage.
Protect cookie-authenticated writes from CSRF where your auth design needs it.
Clear session cookies on logout.
```

For a dedicated App Router auth guide covering Auth.js, cookies, sessions, CSRF, OAuth, authorization, multi-tenant roles, and auth testing, see [nextjs-auth.md](nextjs-auth.md).

Security checklist:

```text
Validate all input at runtime.
Escape/render user content safely.
Avoid dangerouslySetInnerHTML unless content is trusted and sanitized.
Never return password hashes, tokens, private keys, or internal error details.
Keep server-only code out of Client Component imports.
Rate-limit sensitive actions such as login, signup, password reset, and expensive writes.
Audit dependencies and upgrade intentionally.
```

## 13. Metadata, Images, Fonts, and Styling

Use metadata exports for SEO and sharing previews.

```tsx
// app/products/[id]/page.tsx
import type { Metadata } from "next";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Product ${id}`,
    description: "Product details",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <h1>Product {id}</h1>;
}
```

Use `next/image` for optimized images when possible.

```tsx
import Image from "next/image";

export function ProductImage() {
  return (
    <Image
      src="/products/notebook.png"
      alt="Notebook"
      width={640}
      height={480}
      priority
    />
  );
}
```

Files in `public/` are referenced from the site root:

```text
public/logo.png -> /logo.png
```

Styling choices:

```text
Global CSS       app/globals.css, imported by root layout.
CSS Modules      component.module.css for scoped component styles.
Tailwind CSS     common default in create-next-app.
Sass             supported when installed.
CSS-in-JS        check App Router and Server Component compatibility.
```

For choosing styling tools, headless UI, component libraries, icons, animation, tables, and charts, see [frontend-design.md](frontend-design.md). For dedicated Tailwind and shadcn/ui notes, see [tailwind.md](tailwind.md) and [shadcn.md](shadcn.md).

## 14. Error Handling and Not Found UI

Expected errors are part of normal application flow. Return them as values from Server Functions or render a clear UI in Server Components.

Use `notFound()` for missing resources.

```tsx
// app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <h1>{post.title}</h1>;
}
```

```tsx
// app/posts/[slug]/not-found.tsx
export default function NotFound() {
  return <p>Post not found.</p>;
}
```

Use `error.tsx` for uncaught render errors in a route segment.

```tsx
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Dashboard failed to load.</h2>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
```

Do not use error boundaries for expected validation states. Use normal return values and accessible messages.

## 15. Performance

Next.js performance starts with the server/client boundary.

```text
Keep most UI as Server Components by default.
Move only interactive leaves into Client Components.
Fetch data on the server when SEO, security, or first render matters.
Use Suspense and loading.tsx for slow route pieces.
Use next/image and next/font instead of unoptimized assets.
Avoid importing large server-only libraries into Client Components.
Prefer route-level code splitting and dynamic imports for heavy browser-only UI.
Measure with Lighthouse, Web Vitals, bundle analysis, and real-user monitoring.
```

Dynamic import example:

```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./chart"), {
  loading: () => <p>Loading chart...</p>,
});

export function AnalyticsPanel() {
  return <Chart />;
}
```

Performance is not just "make everything static." Private dashboards, fresh user data, and frequently changing data may need dynamic rendering. Make rendering and caching choices based on correctness first, then speed.

## 16. Testing

Useful testing layers:

```text
Type checking      npm run build or npx tsc --noEmit if configured.
Linting            npm run lint.
Unit tests         pure helpers, validation schemas, data mappers.
Component tests    forms, states, accessible behavior.
Route handlers     Request/Response behavior and status codes.
Server Functions   validation, auth, authorization, mutation results.
E2E tests          Playwright user journeys across real routes.
Production build   npm run build before deployment.
```

Test the risky boundaries:

```text
Unauthenticated user is redirected or rejected.
Authenticated user cannot access another user's data.
Invalid form input returns field errors.
Mutation revalidates the page or cache tag.
Route Handler returns the correct status and safe response body.
404 and error UIs render without leaking internals.
```

Use [browser-tools.md](browser-tools.md) to debug hydration, network, cookies, storage, and performance behavior in the browser.

For a deeper frontend testing guide covering Vitest, Testing Library, MSW, Playwright, Storybook, accessibility checks, and visual regression, see [frontend-testing.md](frontend-testing.md).

## 17. Deployment and Operations

Common deployment flow:

```sh
npm ci
npm run build
npm run start
```

Deployment options:

```text
Node.js server     supports all Next.js features.
Docker container  useful when you manage infrastructure directly.
Static export     limited; only for fully static sites.
Adapters          platform-specific support varies.
Vercel            first-party platform with integrated Next.js features.
```

Production checklist:

```text
Set production environment variables in the host, not in committed files.
Run database migrations deliberately.
Check npm audit and dependency updates intentionally.
Build with the same major Node version used in production.
Verify redirects, proxy behavior, auth cookies, and cache headers.
Confirm error reporting, logs, metrics, and request IDs work.
Run smoke tests for login, key pages, mutations, and webhooks.
Do not enable production browser source maps unless you understand the exposure.
```

Use `next start` only after `next build`. `next dev` is for local development.

## 18. Commands To Remember

```sh
# Create app: writes files and installs dependencies
npx create-next-app@latest my-next-app --yes

# Development server
npm run dev

# Production build
npm run build

# Start built production server
npm run start

# Lint when configured
npm run lint

# Upgrade Next.js 16.1+ using the installed Next CLI
npm exec next upgrade

# Older versions or manual upgrade fallback
npx @next/codemod@canary upgrade latest
npm install next@latest react@latest react-dom@latest eslint-config-next@latest

# Prisma in a Next.js app
npx prisma generate
npx prisma migrate dev --name add_model
npx prisma migrate deploy
```

Command safety:

```text
npm run dev      starts local server
npm run build    writes build output
npm install      changes dependencies and lockfile
prisma migrate   changes database schema
```

## 19. Common Mistakes

### Adding `"use client"` everywhere

This turns too much of the app into browser JavaScript. Keep the page/layout/data-fetching layer server-side, then add Client Components only where interaction needs them.

### Using browser APIs in Server Components

`window`, `document`, `localStorage`, and event handlers belong in Client Components.

### Trusting TypeScript at runtime

TypeScript does not validate `FormData`, route params, search params, JSON bodies, cookies, headers, or database records at runtime. Use Zod or another runtime validator at boundaries.

### Forgetting authorization in mutations

A Server Function or Route Handler can be called directly. Check session and ownership inside the server-side function that mutates data.

### Returning unsafe database fields

Use Prisma `select` and DTOs. Never return password hashes, secret tokens, private notes, or admin-only fields by accident.

### Copying old caching examples blindly

Next.js caching has changed across versions. Check whether your project uses Cache Components or the previous model before choosing `use cache`, `cacheLife`, `cacheTag`, `force-cache`, `revalidate`, or `no-store`.

### Calling your own API from a Server Component

If the data lives in your database and the component is already on the server, call a server-only helper directly. Route Handlers are for HTTP boundaries.

### Treating Proxy as complete security

Proxy is useful for early routing and request-boundary work, but final authorization must live close to the protected data operation.

## 20. Practice Path

1. Create a new Next.js app with TypeScript and App Router.
2. Build static routes: `/`, `/about`, and `/posts`.
3. Add a nested dashboard layout with navigation.
4. Add a dynamic route: `/posts/[slug]`.
5. Use `params` and `searchParams` correctly with `await`.
6. Fetch server data and render loading UI with `loading.tsx`.
7. Add a Client Component for a search box or theme toggle.
8. Create a Server Function for a form mutation with Zod validation.
9. Revalidate a route or cache tag after mutation.
10. Add a Route Handler for `/api/health`.
11. Add auth checks and ownership checks around protected data.
12. Connect Prisma and return safe selected fields.
13. Add `not-found.tsx` and `error.tsx`.
14. Run a production build and fix all errors.
15. Test the main user journey with Playwright or manual browser checks.

## 21. Interview Questions and Answers

### 1. What does Next.js add to React?

Routing, layouts, server rendering, data fetching conventions, Server Components, Server Functions, metadata, image/font optimization, Route Handlers, and deployment/build conventions.

### 2. What is the App Router?

The modern Next.js router based on the `app/` directory, file-system routes, nested layouts, Server Components, Suspense, streaming, and Server Functions.

### 3. What is the difference between a Server Component and Client Component?

A Server Component runs on the server by default and can access server resources. A Client Component runs in the browser and is needed for state, effects, event handlers, and browser APIs.

### 4. When do you use `"use client"`?

Use it at the top of a file whose exported component needs browser interactivity, Hooks like `useState` or `useEffect`, event handlers, or browser-only APIs.

### 5. What is a Server Function?

An async function marked with `"use server"` that runs on the server. When used for forms or mutations, it is often called a Server Action.

### 6. What is a Route Handler?

A file named `route.ts` or `route.js` that handles HTTP methods such as `GET` and `POST` using Web `Request` and `Response` APIs.

### 7. Why should Server Components not call your own API routes for database data?

Because Server Components already run on the server. Calling your own HTTP endpoint adds overhead and duplicates auth/data logic when a server-only helper or data access layer would be simpler.

### 8. How do you protect a mutation?

Authenticate the user, authorize ownership or role, validate runtime input, perform the mutation, return safe data, and revalidate affected routes or cache tags.

### 9. What does `NEXT_PUBLIC_` mean?

It marks an environment variable as safe to bundle into browser JavaScript. Never prefix secrets with `NEXT_PUBLIC_`.

### 10. Why is caching tricky in Next.js?

Caching behavior depends on the Next.js version, router, route settings, whether Cache Components are enabled, and whether data is public, private, static, dynamic, or mutation-driven.

## Quick Reference

```text
page.tsx        route UI
layout.tsx      shared UI wrapper
loading.tsx     route-level Suspense fallback
error.tsx       route-level error boundary; Client Component
not-found.tsx   404 UI for notFound()
route.ts        HTTP endpoint
proxy.ts        server request-boundary logic
"use client"    browser component boundary
"use server"    server function boundary
"use cache"     Cache Components caching directive
```

## Resources

- Next.js App Router docs: https://nextjs.org/docs/app
- Installation: https://nextjs.org/docs/app/getting-started/installation
- Project structure: https://nextjs.org/docs/app/getting-started/project-structure
- Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Fetching data: https://nextjs.org/docs/app/getting-started/fetching-data
- Caching: https://nextjs.org/docs/app/getting-started/caching
- Mutating data: https://nextjs.org/docs/app/getting-started/mutating-data
- Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Environment variables: https://nextjs.org/docs/app/guides/environment-variables
- Data security: https://nextjs.org/docs/app/guides/data-security
- Deploying: https://nextjs.org/docs/app/getting-started/deploying
- Upgrading: https://nextjs.org/docs/app/getting-started/upgrading
- Next.js 16 release: https://nextjs.org/blog/next-16

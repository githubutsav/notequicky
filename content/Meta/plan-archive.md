# Archived Notes Expansion Plan

This is the original planning content that was replaced when `plan.md` became the current status tracker.

## Goal

Turn this folder into a practical JavaScript, TypeScript, React, and full-stack reference set: concepts, production guidance, repeatable commands, and keyboard shortcuts. The notes should be useful for revision while including runnable examples and clear safety warnings.

## Scope and Deliverables

### 1. Expand `javascript.md`

Add a **JavaScript in Production** section after testing and before the practice roadmap. Cover:

- Project structure, module boundaries, configuration, and environment variables.
- Input validation, authentication versus authorization, CORS, CSRF, XSS, secrets, and dependency updates.
- Error handling, structured logging, observability, health checks, and safe user-facing errors.
- Performance: measuring first, bundle size, code splitting, caching, pagination, and avoiding main-thread blocking.
- Reliability: timeouts, retries only when safe, cancellation, idempotency, graceful shutdown, and rate limits.
- Testing layers, CI checks, production build verification, and a deploy/release checklist.

Add a **Useful JavaScript and Node Commands** section with commands for running scripts, tests, linting, formatting, dependency auditing, inspecting Node/npm versions, and environment variables. Commands will explain their purpose and flag commands that can change dependencies or production state.

### 2. Create `command.md`

Create a cross-platform command and keyboard-shortcut reference organized by task:

- Terminal navigation, files, search, process control, Git, Node/npm, and project quality commands.
- VS Code shortcuts for editing, search, navigation, terminal, debugging, source control, and Markdown preview.
- macOS-focused shortcuts first because the current development environment is macOS; include Windows/Linux alternatives where they differ materially.
- A short command-safety legend: read-only, writes files, changes dependencies, and potentially destructive.

No personal secrets, machine-specific paths, or irreversible commands without a clear warning will be included.

### 3. Create `typescript.md`

Build a TypeScript learning and production guide aligned with `javascript.md`, covering:

- Why TypeScript exists, what it checks, and its runtime limitation: types are erased.
- Setup: `tsconfig.json`, `tsc`, `tsx`, Node ESM, strict mode, and incremental adoption from JavaScript.
- Everyday types: inference, annotations, objects, arrays, tuples, unions, literals, enums versus `as const`, and narrowing.
- Functions, generics, utility types, `keyof`, indexed access, mapped and conditional types, and overloads.
- `unknown` versus `any`, `never`, type assertions, type guards, discriminated unions, and runtime validation.
- Classes, modules, declaration files, third-party types, and JavaScript interoperability.
- TypeScript with DOM, `fetch`, async code, Node, and Prisma-oriented examples.
- Production practices: strict compiler options, avoiding unsafe assertions, boundary validation, linting, testing, build/type-check CI, and a release checklist.
- A learning order, exercises, interview questions, and carefully selected official resources.

## Writing Rules

- Use the existing notes' style: numbered sections, concise explanations, runnable JavaScript/TypeScript snippets, and practical warnings.
- Explain when an API is browser-only, Node-only, or both.
- Distinguish compile-time TypeScript safety from runtime validation and security.
- Prefer stable commands and official tooling. Clearly label version-dependent or destructive commands.
- Cross-link related notes by filename where useful, without duplicating long material.

## Implementation Order

1. Add production and command sections to `javascript.md`.
2. Create `command.md`, then verify every shortcut and command is correctly scoped and clearly labeled.
3. Create `typescript.md`, using the same teaching progression as `javascript.md`.
4. Review headings, code fences, numbering, commands, and internal links across all notes.

## Acceptance Checks

- All Markdown fences are balanced and headings are consistently numbered.
- Every command has a stated purpose and a safety warning when it writes, installs, or deletes.
- TypeScript examples type-check conceptually under strict mode and do not imply runtime safety from types alone.
- Production guidance includes security, observability, performance, reliability, testing, CI, and release checks.
- The new files are concise references rather than copied documentation.

## Libraries Note Plan

### Goal

Create `libraries.md` as a practical full-stack library guide: when to use a library, the minimum safe setup, common mistakes, and how it fits into an application. It will complement `javascript.md`, `typescript.md`, `Prisma.md`, and `command.md` instead of repeating their general language or command material.

### Scope

Organize libraries by responsibility rather than listing packages without context:

- **Security and authentication:** `bcrypt`/`bcryptjs`, `jsonwebtoken`, cookie helpers, environment configuration, and input validation. Explain password hashing versus encryption, JWT signing versus verification, token expiry, authorization, and the limits of JWTs.
- **HTTP and APIs:** `axios`, native `fetch`, retry/timeout/cancellation patterns, request interceptors, and safe error handling. Explain when native `fetch` is enough.
- **Backend essentials:** `cors`, `helmet`, request logging, rate limiting, environment configuration, and validation libraries such as Zod. Express/Fastify implementation will live in a future `express.md`.
- **Database and uploads:** Prisma reference points, file-upload middleware concepts, object storage boundaries, and why uploaded files require validation.
- **Small utilities:** `date-fns`, `clsx`, and `lodash-es` only when justified. React, Next.js, routing, and frontend state/data-fetching integration will live in future dedicated notes.
- **Testing and quality:** Vitest/Jest concepts, Supertest, ESLint, Prettier, and environment/test-database practices.

### Format for Each Library

Each entry will include:

1. What problem it solves and when not to use it.
2. Install command and whether it changes runtime or development dependencies.
3. A minimal, current JavaScript/TypeScript example.
4. Security, performance, or operational cautions.
5. Closely related alternatives and links to official documentation.

### Explicit Safety Rules

- Never include real secrets, plaintext passwords, production connection strings, or an insecure JWT secret.
- Do not recommend `jwt.decode()` for trust decisions, storing JWTs casually in `localStorage`, or using CORS as authorization.
- Treat external input, uploaded files, and decoded JSON as untrusted until validated.
- Mark packages and APIs whose setup varies significantly by runtime or major version.
- Prefer small dependency sets; include a library only when it solves a real problem better than a built-in API.

### Production Integration Section

`libraries.md` will include a dedicated **Putting Libraries Together in Production** section. It will explain the boundaries and deployment flow without teaching Express, WebSockets, React, or Next.js implementation details:

```text
HTTP framework (future express.md)
  -> request ID, rate limits, security headers, CORS
  -> Zod validates request input and environment configuration
  -> authorization check uses authenticated identity and resource ownership
  -> Prisma reads/writes the database inside deliberate transactions
  -> bcrypt hashes passwords; JWT library signs/verifies short-lived tokens
  -> structured logger records safe operational context
  -> response serializer returns only the intended public fields
```

It will also cover:

- One composition example: registration, login, and protected-resource flows, with library responsibilities clearly separated.
- Runtime validation with Zod before Prisma; TypeScript types alone are not enough.
- Password hashing at registration/reset only, comparison at login, and never returning password hashes.
- JWT verification, expiry, issuer/audience where applicable, key rotation, and authorization on every protected action.
- Axios/fetch configuration for timeouts, cancellation, normalized errors, retries only for safe requests, and request IDs.
- Environment configuration validation at startup, secret management, dependency locking/auditing, structured logging, metrics, health checks, tests, CI, migrations, and release checks.
- A production checklist and incident-oriented cautions: no secrets in logs, no unaudited automatic dependency fixes, no blind retries of writes, and no database migration from every app replica on startup.

### Deferred Dedicated Notes

The following will be cross-referenced but intentionally excluded from implementation detail in `libraries.md`:

- `express.md`: routing, middleware composition, controllers, API error middleware, and server lifecycle.
- `websocket.md`: WebSocket protocol, connection lifecycle, scaling, authentication, and real-time delivery.
- React/Next.js notes: components, routing, rendering, frontend state, forms, and framework-specific production deployment.

### Implementation Order

1. Check official documentation for current package APIs and security guidance.
2. Create `libraries.md` with a quick library-selection guide and the core backend entries first: password hashing, JWTs, validation, HTTP, and security middleware.
3. Add supporting database, upload, frontend, utility, testing, and quality-tool entries.
4. Cross-link the existing JavaScript, TypeScript, Prisma, and command notes.
5. Verify code fences, commands, links, and that every security-sensitive example has a warning.

### Acceptance Checks

- The document differentiates authentication from authorization and compile-time types from runtime validation.
- Every package recommendation has a concrete use case and an alternative or reason to prefer a built-in API.
- All install commands identify whether they add runtime or development dependencies.
- Examples use environment variables for secrets and show error handling where needed.
- The document stays a practical revision note, not a package directory.

## React Note Plan

### Goal

Create `react.md` as a practical beginner-to-production React guide that fits the style of the existing notes. It should teach the mental model first, then show the everyday patterns needed to build real components, forms, data flows, and tested UI.

### Plan Used for the First Pass

1. Read the existing notes to match their format: numbered sections, runnable examples, practical warnings, and references.
2. Check current official React documentation before writing version-sensitive material. The first pass assumes modern React 19.x, function components, Hooks, TypeScript, Vite for learning projects, and frameworks such as Next.js when routing, data loading, server rendering, or deployment conventions matter.
3. Build the guide in learning order:
   - Setup and mental model.
   - Components, JSX, props, children, lists, conditions, events, and state.
   - Forms, controlled inputs, choosing state, immutable updates, effects, refs, Hooks rules, and custom Hooks.
   - Context, reducers, component design, TypeScript with React, styling, performance, routing, data loading, React 19 features, testing, mistakes, practice projects, and repositories to learn from.
4. Keep examples small and safe. Avoid real secrets, avoid unsafe HTML, mark when TypeScript does not replace runtime validation, and prefer semantic HTML.
5. Add a quick reference and official React links, then verify headings, code fences, and ASCII-safe Markdown.

### Comparison Notes

Compared against:

- Official React docs: https://react.dev/learn and https://react.dev/reference/react/hooks
- React versions page: https://react.dev/versions
- The Odin Project React curriculum: https://www.theodinproject.com/paths/full-stack-javascript/courses/react
- roadmap.sh React roadmap: https://roadmap.sh/react
- Bulletproof React architecture guide: https://github.com/alan2207/bulletproof-react
- Awesome React ecosystem index: https://project-awesome.org/r/awesome-react
- Full Stack Open course structure and updates: https://fullstackopen.com/en/part0/general_info/

Current `react.md` covers the core learning path well: components, JSX, props, keys, state, events, forms, effects, refs, custom Hooks, context, reducers, component design, TypeScript, styling, performance basics, routing/data-loading choices, React 19 notes, testing, common mistakes, and a practice path.

The repo-reading section should include practical examples such as Bulletproof React, shadcn/ui, Dub, Cal.com, Formbricks, Vercel Commerce, and Documenso. The goal is to teach how to study real codebases without copying oversized architecture into small learning apps.

### Advanced React Pass

Completed in `react.md`:

- Error boundaries and recovery UI.
- `Suspense`, `lazy`, and code splitting.
- `useTransition`, `useDeferredValue`, and responsive UI during expensive updates.
- React Compiler, React DevTools, and profiling workflow.
- Portals for modals, popovers, and overlays.
- Production architecture: feature folders, shared components, API layer, config validation, route boundaries, and import boundaries.
- Data fetching in real apps: TanStack Query/SWR, cache invalidation, mutations, retries, and request cancellation.
- Form libraries and validation: React Hook Form, Zod, server validation, field errors, and accessible error messages.
- Frontend security: XSS, unsafe HTML, token storage tradeoffs, CSRF with cookies, dependency auditing, safe logging, and server-side authorization.
- Deeper accessibility: keyboard flow, focus management, ARIA cautions, and form error states.
- Repository study exercises for Dub, Cal.com, Formbricks, Vercel Commerce, and shadcn/ui.

Still useful for a later dedicated note:

- Framework-specific SSR, hydration, React Server Components, and server actions in depth.
- State management choices beyond Context and reducers: Redux Toolkit, Zustand, Jotai, and URL state.
- Testing beyond the basic example: MSW, integration tests, Playwright user journeys, router tests, and error/loading states.
- Component documentation and visual QA with Storybook or similar tools.
- Common UI domains: advanced tables, charts, virtualization, i18n, animation, file uploads, and offline/local-first patterns.
- Legacy class components and lifecycle methods as maintenance knowledge only.

## Reusable Implementation Prompt

```text
Update the notes in this repository according to plan.md.

First, read javascript.md, Prisma.md, and plan.md. Preserve their concise learning-note style and do not remove existing material unless it is inaccurate or duplicated by the new content.

Implement all deliverables from plan.md:
1. Add JavaScript production guidance and useful JavaScript/Node commands to javascript.md.
2. Create command.md with macOS-first VS Code keyboard shortcuts and practical terminal, Git, Node/npm, and project-quality commands. Include Windows/Linux alternatives where materially different. Label commands that write files, modify dependencies, or can be destructive.
3. Create typescript.md as a practical beginner-to-production guide. Cover strict setup, core types, narrowing, generics, utility types, modules, Node/browser examples, runtime validation, production practices, exercises, interview questions, and official resources. Clearly state that TypeScript types are erased at runtime.

Use runnable, minimal examples. Avoid secrets and unsafe commands. When complete, verify Markdown code fences, heading numbering, and internal links, then summarize the exact files changed and the checks performed.
```

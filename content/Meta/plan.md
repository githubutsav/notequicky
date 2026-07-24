# Notes Status Tracker

## Goal

Keep this folder as a practical JavaScript, TypeScript, React, Prisma, browser tooling, and full-stack reference set. Each note should stay useful for revision: concise explanations, runnable examples, safety warnings, and links to deeper resources.

The original expansion roadmap is archived in [plan-archive.md](plan-archive.md).

## Done

- `javascript.md`: core JavaScript guide with browser, Node, production, commands, resources, and interview questions.
- `typescript.md`: beginner-to-production TypeScript guide with strict-mode concepts, runtime validation cautions, Prisma examples, commands, practice, and interview questions.
- `command.md`: macOS-first terminal, Git, Node/npm, Prisma, VS Code, and project-check command reference with safety labels.
- `libraries.md`: practical full-stack library guide covering validation, password hashing, JWTs, HTTP clients, security middleware, logging, Prisma boundaries, utilities, testing, and production composition.
- `react.md`: beginner-to-production React guide covering components, state, effects, refs, custom Hooks, context, reducers, TypeScript, styling, performance, routing/data loading, React 19, testing, architecture, accessibility, security, profiling, and repository study.
- `frontend-design.md`: practical frontend design and UI library guide covering CSS foundations, responsive layout, typography, spacing, color, accessibility, design tokens, styling choices, headless UI, component libraries, icons, animation, tables, charts, drag/drop, production stacks, when-to-use-what decision guidance, and practice tasks.
- `color.md`: UI color guide covering color roles, contrast, palette anatomy, neutrals, brand color, semantic colors, data colors, dark mode, UI states, CSS tokens, Tailwind tokens, shadcn/ui tokens, checks, and practice tasks.
- `tailwind.md`: Tailwind CSS guide covering setup, utilities, layout, spacing, typography, state variants, responsive design, theme tokens, dark mode, class composition, forms, dashboards, production checks, and commands.
- `shadcn.md`: shadcn/ui guide covering setup, CLI workflow, generated files, `components.json`, component anatomy, theming, Tailwind v4 notes, Server/Client Component boundaries, forms, customization, updates, accessibility, and production checks.
- `frontend-testing.md`: frontend testing guide covering Vitest, Testing Library, user-event, MSW, Playwright, Storybook, accessibility checks, visual regression, CI strategy, common mistakes, commands, and practice tasks.
- `ui-patterns.md`: practical UI pattern cookbook covering buttons, forms, settings pages, dashboards, tables, filters, empty states, loading, errors, dialogs, command menus, uploads, navigation, toasts, destructive actions, detail pages, responsive behavior, and pattern testing.
- `state-management.md`: React state-management guide covering built-ins, server state, TanStack Query, Zustand, Redux Toolkit, Jotai, Recoil maintenance status, URL state, form state, persistence, production checks, practice, and interview questions.
- `nextjs.md`: App Router guide covering setup, layouts, Server and Client Components, data fetching, caching, Server Functions, Route Handlers, environment variables, Prisma boundaries, auth/security, metadata, error handling, performance, testing, deployment, commands, and practice.
- `nextjs-auth.md`: Next.js authentication and authorization guide covering Auth.js, sessions, cookies, credentials, OAuth, authorization layers, data access, CSRF, XSS, password reset, multi-tenant roles, rate limiting, testing, commands, and production checks.
- `Prisma.md`: Prisma revision notebook with current project state, schema basics, CRUD, relations, migrations, seeding, transactions, production checklist, commands, resources, and practice tasks.
- `browser-tools.md`: Chrome DevTools workflow guide for Elements, Console, Sources, Network, storage, performance, security, and production incident debugging.

## Current Backlog

### Remaining Work Priority

Work through these one by one:

1. `express.md`: Express routing, middleware composition, controllers, services, repositories, API error middleware, request context, validation boundaries, auth checks, rate limits, logging, graceful shutdown, and production server lifecycle.
2. `websocket.md`: WebSocket protocol basics, connection lifecycle, authentication, authorization, rooms/channels, heartbeats, reconnects, scaling, delivery guarantees, and real-time UI patterns.
3. State-management comparison table: compact comparison for SWR, RTK Query, Apollo Client, and XState, linked from `state-management.md`.
4. Prisma authorization exercises: add small exercises pairing Prisma with validation and authorization checks from `libraries.md` and `nextjs-auth.md`.
5. Optional `prisma-production.md`: split Prisma production deployment, migrations, backups, connection pooling, observability, and incident checks if `Prisma.md` becomes too heavy.
6. Optional advanced UI domain notes: focused notes for tables, charts, virtualization, i18n, animation, file uploads, and offline/local-first patterns if those topics need more depth than `frontend-design.md` and `ui-patterns.md`.

### Root Navigation

- Keep `README.md` updated as the main index for the notes folder.
- Keep `plan.md`, `README.md`, and `command.md` in sync when adding or significantly changing notes.
- Update `command.md` whenever a new note introduces important setup, testing, build, database, deployment, or safety-sensitive commands.
- Add short "read next" links inside large notes where a topic continues elsewhere.

### React

- Consider later adding focused notes for advanced UI domains: tables, charts, virtualization, i18n, animation, file uploads, and offline/local-first patterns.

### State Management

- Keep `state-management.md` current with ecosystem maintenance status, especially Recoil, Redux Toolkit, TanStack Query, Zustand, and Jotai.
- Consider later adding a compact comparison table for SWR, RTK Query, Apollo Client, and XState.

### Frontend Design

- Keep `frontend-design.md` current with styling, component library, animation, charting, table, and drag/drop ecosystem changes.
- Keep the `frontend-design.md` "When To Use What" section aligned with real project choices, especially SaaS, enterprise dashboard, accessibility-heavy, prototype, and data-heavy workflows.
- Keep `color.md` aligned with current CSS color support, WCAG contrast guidance, Tailwind color tokens, and shadcn/ui theme conventions.
- Keep `tailwind.md` and `shadcn.md` aligned with current Tailwind CSS, shadcn/ui CLI, registry, theming, and setup guidance.
- Keep `frontend-testing.md` aligned with current Vitest, Testing Library, MSW, Playwright, Storybook, axe, and visual regression guidance.
- Keep `ui-patterns.md` aligned with practical product UI patterns, especially forms, dashboards, tables, filters, dialogs, command menus, uploads, empty states, loading states, error states, and responsive behavior.

### Next.js

- Keep `nextjs.md` aligned with current App Router caching, Server Function, Proxy, and upgrade guidance because these areas change across major versions.
- Keep `nextjs-auth.md` aligned with current Next.js authentication, cookies, Proxy, Server Function, Auth.js, CSRF, OAuth, and authorization guidance.

### Prisma

- Consider splitting the production checklist into a shorter standalone `prisma-production.md` if `Prisma.md` becomes too heavy for revision.
- Add small exercises that pair Prisma with validation and authorization checks from `libraries.md`.

### Backend

- Create `express.md` later for routing, middleware composition, controllers, API error middleware, request context, and server lifecycle.
- Create `websocket.md` later for WebSocket protocol basics, connection lifecycle, authentication, scaling, and real-time delivery.

### Quality

- Periodically check that Markdown code fences are balanced.
- Keep commands labeled clearly as read-only, writes files, changes dependencies, or destructive.
- Avoid secrets, real production connection strings, plaintext passwords, unsafe JWT examples, and irreversible commands without clear warnings.

## Maintenance Checklist

- Headings use the existing numbered-note style where useful.
- Code examples are minimal, runnable, and safe.
- TypeScript notes distinguish compile-time checks from runtime validation.
- Security-sensitive notes distinguish authentication from authorization.
- Production guidance includes security, observability, performance, reliability, testing, CI, and release checks.
- Cross-links point to the most relevant sibling notes instead of duplicating long explanations.
- New or changed notes are checked against the dependent files: `README.md` for navigation, `plan.md` for status/backlog, and `command.md` for reusable commands.

## Reusable Update Prompt

```text
Update the notes in this repository while preserving the concise learning-note style.

First, read README.md, plan.md, command.md, and the specific note files related to the task.
Keep changes focused. Do not remove existing material unless it is inaccurate, duplicated, or replaced by a clearer version.

Use runnable, minimal examples. Avoid secrets and unsafe commands.
When complete, update dependent files where needed: README.md for navigation, plan.md for status/backlog, and command.md for reusable commands.
Verify Markdown code fences, headings, commands, and internal links, then summarize the exact files changed and checks performed.
```

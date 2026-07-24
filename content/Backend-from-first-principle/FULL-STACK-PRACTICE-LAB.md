# Full-Stack Practice Lab — React, Next.js, TypeScript, Backend, and DevOps

> This is a deeper companion to the study guides. It teaches one practical full-stack shape; it is not a claim about the videos.

The backend guides use Fastify because it keeps the HTTP layer easy to see. That is a teaching choice, not a rule. The same ideas transfer to Next.js route handlers, Express, NestJS, Hono, Go, Java, Python, .NET, or another stack:

~~~text
React/Next.js UI -> typed request contract -> API/use case -> data store
                 -> auth boundary          -> cache/queue/search when needed
                 -> tests                 -> logs/metrics/traces -> deployment
~~~

The technologies change. The responsibilities do not.

## 1. Build one realistic system

Use a small project-management application:

- A user signs in and belongs to an organization.
- A user can list and create projects in only their organization.
- The Next.js app renders the UI.
- The API validates input and applies authorization.
- PostgreSQL stores durable data.
- Redis is added for caching/queues only after the basic path works.
- Docker runs local dependencies.
- Tests and telemetry make it safe to change.

## 2. A practical workspace

~~~text
full-stack-lab/
  apps/
    web/                         Next.js + React UI
      app/
        projects/
          page.tsx               server-rendered list page
          new/
            page.tsx             page that renders the client form
      components/
        create-project-form.tsx
    api/                         Fastify API
      src/
        server.ts
        routes/projects.ts
        services/create-project.ts
        repositories/project-repository.ts
  packages/
    contracts/
      src/project.ts             shared request/response shapes
  infra/
    docker-compose.yml
  package.json
~~~

You do not need a monorepo on day one. Use this layout when a frontend and API need to share a contract without copying types by hand.

## 3. Put the request contract in one place

Create packages/contracts/src/project.ts:

~~~ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type ProjectResponse = {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
};
~~~

### Code walkthrough

- import { z } from zod imports a runtime validator. TypeScript types disappear when JavaScript runs; Zod still checks a real HTTP body at runtime.
- createProjectSchema is the server contract: a name must be text, whitespace is removed, and a name cannot be empty or enormous.
- z.infer creates a TypeScript type from that same schema. This prevents the type and validator from drifting apart.
- ProjectResponse is deliberately smaller than a database row. Do not send internal columns simply because they exist in PostgreSQL.

The frontend may use CreateProjectInput for editor autocomplete, but the API must still call createProjectSchema.parse or safeParse. A browser is not a trust boundary.

## 4. The API owns validation, authorization, and durable state

Create the use case in apps/api/src/services/create-project.ts:

~~~ts
import { randomUUID } from "node:crypto";
import type { CreateProjectInput, ProjectResponse } from "@lab/contracts";

type Actor = {
  userId: string;
  organizationId: string;
};

type ProjectRepository = {
  create(input: {
    id: string;
    name: string;
    organizationId: string;
  }): Promise<ProjectResponse>;
};

export function buildCreateProject(repository: ProjectRepository) {
  return async function createProject(
    actor: Actor,
    input: CreateProjectInput,
  ): Promise<ProjectResponse> {
    return repository.create({
      id: randomUUID(),
      name: input.name,
      organizationId: actor.organizationId,
    });
  };
}
~~~

### Code walkthrough

- Actor is a trusted identity created by authentication middleware, not a value taken from the request body.
- ProjectRepository is an interface. The service does not need to know whether data comes from PostgreSQL, a test fake, or another storage adapter.
- buildCreateProject receives dependencies once and returns the use-case function. This makes tests small and avoids global database clients.
- randomUUID creates a server-side id. The client must not choose identifiers for records it does not own.
- organizationId comes from actor, not input. That prevents a caller from creating a project under another organization by editing JSON in browser developer tools.

Expose it from apps/api/src/routes/projects.ts:

~~~ts
import type { FastifyPluginAsync } from "fastify";
import { createProjectSchema } from "@lab/contracts";

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", async (request, reply) => {
    const input = createProjectSchema.parse(request.body);
    const actor = request.currentUser;

    if (!actor) {
      return reply.code(401).send({
        code: "UNAUTHENTICATED",
      });
    }

    const project = await app.createProject(actor, input);

    return reply.code(201).send(project);
  });
};
~~~

### Route walkthrough

- The route converts untrusted HTTP JSON into input once.
- The route gets actor from request.currentUser, which authentication middleware has verified.
- 401 means no usable identity was provided. A logged-in user who lacks permission would generally receive 403 or a resource-safe 404 depending on your policy.
- The service performs the business action. The route does not write SQL itself.
- 201 means a resource was created. The response is a deliberate public shape.

## 5. The React/Next.js form is an API client, not an authority

Create apps/web/components/create-project-form.tsx:

~~~tsx
"use client";

import { useState } from "react";

type FormState = {
  name: string;
  error: string | null;
  saving: boolean;
};

export function CreateProjectForm() {
  const [state, setState] = useState<FormState>({
    name: "",
    error: null,
    saving: false,
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: null }));

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: state.name,
      }),
    });

    if (!response.ok) {
      setState((current) => ({
        ...current,
        saving: false,
        error: "Could not create the project.",
      }));
      return;
    }

    setState({
      name: "",
      error: null,
      saving: false,
    });
  }

  return (
    <form onSubmit={submit}>
      <label>
        Project name
        <input
          value={state.name}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
        />
      </label>
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button disabled={state.saving}>
        {state.saving ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
~~~

### Component walkthrough

- "use client" is required because this component uses React state and browser events. It does not make the whole Next.js application client-rendered.
- state is one object so the form’s value, error, and pending state update together predictably.
- preventDefault stops the browser’s normal full-page form submission.
- fetch sends JSON to the API. The frontend chooses what to display; it does not decide whether the user may create a project.
- response.ok handles both validation and authorization failures as a failed UI action. A production app should map stable API error codes to helpful messages.
- disabling the button prevents an accidental double click, but the backend must still handle retries/idempotency because client-side protection is not enough.

## 6. Next.js routing choices

You can use either arrangement:

~~~text
Browser -> Next.js -> Fastify API -> PostgreSQL
Browser ---------------------------> Fastify API
~~~

Use a Next.js route handler/proxy when it simplifies cookies, server-side rendering, or one public origin. Use a separate API directly when mobile clients, other services, or a clear backend boundary require it. Both still need an explicit contract, authentication, authorization, validation, timeouts, and observability.

## 7. Run local infrastructure with Docker Compose

Create infra/docker-compose.yml:

~~~yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: practice
      POSTGRES_PASSWORD: practice
      POSTGRES_DB: practice
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
~~~

### Infrastructure walkthrough

- postgres and redis are local development dependencies, not copies of your application.
- environment values are deliberately weak local-only credentials. Put real values in a secret manager, never committed Compose files.
- the port mapping lets your API running on the host connect to localhost.
- the named volume preserves database data across container restarts. Remove it when you intentionally want a clean learning database.

Run it:

~~~bash
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml ps
~~~

## 8. Test the boundary before the browser

An API test exercises the contract quickly:

~~~ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/server.js";

test("creates a project for the authenticated organization", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/projects",
    headers: {
      "content-type": "application/json",
      "x-practice-role": "admin",
    },
    payload: {
      name: "Platform",
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().name, "Platform");
});
~~~

The important test is not only “does the route return 201?” Add one proving that the created record has the authenticated organization id, not an organization id supplied by the client.

## 9. What DevOps means in this project

DevOps is not “knowing Docker commands.” It is making the system easy and safe to build, run, observe, deploy, and recover.

~~~text
commit -> typecheck/test -> build image -> run migration safely
       -> deploy -> readiness check -> monitor -> rollback/forward fix
~~~

As the guides progress, add:

- .env.example and startup configuration validation;
- container image and health/readiness endpoints;
- database migration review;
- request id, logs, metrics, traces;
- CI checks for typecheck, tests, lint, and dependency/security scanning;
- deployment settings: resource limits, graceful shutdown, secret injection, and rollback plan.

## 10. Learn technologies as interchangeable tools

The course examples use one route, one validation library, one database client, and one queue so you can see the system. Learn the trade-off behind each, then compare alternatives:

| Responsibility | Example | Other common choices |
| --- | --- | --- |
| React web app | Next.js | Remix, Vite React, Astro |
| HTTP API | Fastify | Express, NestJS, Hono, Next.js route handlers |
| Validation | Zod | Valibot, JSON Schema, Joi |
| SQL access | pg | Prisma, Drizzle, Kysely |
| Cache/queue | Redis/BullMQ | RabbitMQ, SQS, Kafka, Temporal |
| Database | PostgreSQL | MySQL, SQLite, MongoDB for specific models |
| Deployment | Docker | serverless, Kubernetes, managed platforms |

Do not try to memorize every library. Learn the boundary, failure mode, and operational trade-off that makes a tool appropriate.

---
title: "05. Production Deployment and Workflows"
---

## 31. Practice Tasks

Try these one by one in `src/index.ts`.

### Task 1: Create users

Create three users with different usernames, ages, and cities.

### Task 2: Read users

Print all users.

### Task 3: Filter users

Print users from `lucknow`.

### Task 4: Create todos

Create todos for one user.

### Task 5: Include relation

Print all users with their todos.

### Task 6: Select fields

Print only `username`, `city`, and todo `title`.

### Task 7: Update todo

Mark one todo as done.

### Task 8: Delete todo

Delete one todo by id.

### Task 9: Nested create

Create one user with two todos in the same query.

### Task 10: Transaction

Create a user and a todo inside a transaction.


## 32. Good Practice Version Of `src/index.ts`

```ts
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function main() {
  const user = await client.user.upsert({
    where: {
      username: "utsav",
    },
    update: {
      city: "lucknow",
    },
    create: {
      username: "utsav",
      password: "secret",
      age: 24,
      city: "lucknow",
    },
  });

  await client.todo.create({
    data: {
      title: "Learn Prisma",
      description: "Practice create and relations",
      done: false,
      userId: user.id,
    },
  });

  const users = await client.user.findMany({
    include: {
      todos: true,
    },
  });

  console.dir(users, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await client.$disconnect();
  });
```

Note: this version uses `upsert` for the user, so running it again will not create another `utsav` user.
But it still uses `todo.create`, so every run adds one more todo for that user.
That is fine for practice because it lets you see relation data grow.


## 33. Prisma In Production: Complete Checklist

This section is about **Prisma and the database layer only**. It does not try to teach your whole application.
Use it when you move beyond learning CRUD and need to run Prisma safely with real data.

### 1. Keep Prisma Packages and Generated Client In Sync

`prisma` is the CLI that creates migrations and generates code. `@prisma/client` is the code your app imports.

Keep both packages on compatible versions and update them intentionally:

```bash
npx prisma version
npx prisma generate
```

Run `npx prisma generate` after every schema change and as part of your build/deploy process.
Commit the lockfile so every environment installs the same tested package versions.

Your current `prisma-client-js` generator is correct for this Prisma 6 project. Do not change generator type just because a newer Prisma major version exists; follow that major version's upgrade guide in a separate, tested change.

### 2. Make the Database Enforce Important Rules

Do not depend only on TypeScript or frontend checks. Your Prisma schema should describe rules that must still be true if a script, worker, or second application writes to the database.

Useful database-backed rules:

```prisma
model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  done        Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([userId])
  @@index([userId, done])
}
```

What these rules mean:

- `@id` makes each row identifiable.
- `@unique` and `@@unique` prevent duplicate data, even during concurrent requests.
- Required fields prevent accidental `NULL` values.
- Database defaults such as `@default(false)` and `@default(now())` work even when another tool inserts a row.
- `@@index` speeds up real query patterns.
- `onDelete` makes the delete policy explicit.

Choose the delete policy deliberately:

```text
Cascade  -> deleting a user also deletes their todos
Restrict -> do not delete a user while todos exist
SetNull  -> keep the todo but remove its owner; userId must be optional
```

For a business rule Prisma cannot express directly, add reviewed SQL to a migration. Examples include PostgreSQL `CHECK` constraints, special indexes, extensions, and database functions.

### 3. Design Indexes From Real Queries

An index is not something to add to every column. Add one when a frequent query uses a field in `where`, `orderBy`, a relation, or a unique lookup.

Examples:

```prisma
model Todo {
  // fields omitted

  @@index([userId])
  @@index([userId, done])
  @@index([userId, id])
  @@index([createdAt])
}
```

`@@index([userId, done])` can help a query that filters by both fields. `@@index([userId, id])` supports a todo list filtered by user and ordered for cursor pagination. Index order matters, so base it on the exact query you run. Extra indexes make writes slower and use storage.

For PostgreSQL, verify an important slow query with `EXPLAIN ANALYZE`. Do not guess that an index helped; measure it.

### 4. Never Let Prisma Be Your Authorization Layer

Prisma knows how to query rows. It does not know which logged-in person is allowed to read or change them.

Always scope user-owned data in the Prisma query:

```ts
const result = await client.todo.updateMany({
  where: {
    id: todoId,
    userId: currentUser.id,
  },
  data: {
    done: true,
  },
});

if (result.count === 0) {
  throw new Error("Todo not found");
}
```

`updateMany` is useful here because it combines ownership and update in one database query. Never fetch a todo by `id`, then update it later without checking ownership.

For multi-tenant applications, include `tenantId` in schemas, unique constraints, indexes, and every tenant-scoped query. PostgreSQL Row-Level Security can be an additional database defense, but it needs its own careful design and testing.

### 5. Use One Prisma Client and Manage Connections

Create one `PrismaClient` instance per running application process. Reuse it for all requests.

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});
```

Do not create a new client for every request: each client can open its own connection pool.

Connection rules by application type:

```text
Long-running Node server -> create once; disconnect only during graceful shutdown
Development hot reload   -> cache the client on globalThis to avoid extra clients
Serverless/functions     -> reuse the client outside the handler and use a connection pooler
Workers/scripts          -> disconnect when the one-off work finishes
```

Your database has a finite connection limit. Size pools across all app instances, workers, and serverless functions together. Use your database provider's supported connection pooler when needed; do not try to solve a connection-limit problem by creating more Prisma clients.

### 6. Treat Migrations as Reviewed, Versioned Production Code

Migration files are the history of how a real database changed. Commit `schema.prisma` and the new `prisma/migrations/.../migration.sql` folder in the same Git commit.

Normal development flow:

```bash
npx prisma migrate dev --name add_todo_status
npx prisma generate
```

When the SQL needs review or custom work:

```bash
npx prisma migrate dev --create-only --name add_todo_status
```

Then inspect and, if necessary, edit the generated `migration.sql`. This is how you add a PostgreSQL extension, a constraint that is not represented in the Prisma schema, or a small deterministic data change. Apply and test that migration locally after reviewing it.

Do not put a large data backfill in a normal migration. Run large backfills as a separate, resumable deployment job in small batches between the expand and contract releases below.

Production flow:

```bash
npx prisma migrate status
npx prisma migrate deploy
```

Run `migrate deploy` once as a deployment job or release step, before or alongside the new app version. Do not have every app replica try to run migrations on startup.

Never use these against a live production database:

```text
prisma migrate reset
prisma db push
```

Do not edit or delete a migration that has already reached a shared, staging, or production database. Create a new corrective migration instead.

### 7. Use the Expand-Backfill-Contract Pattern for Live Schema Changes

A schema change can be valid but still break an older app version during deployment. For changes to existing, important tables, use this order:

```text
1. Expand: add a nullable column, new table, or new index.
2. Deploy code that can read both old and new shapes and writes the new data.
3. Backfill old rows in small, repeatable batches.
4. Contract: make the column required or remove the old column in a later release.
```

Example: changing `Todo.description` from optional to required is unsafe if old rows contain `NULL`. First add application behavior and backfill every old row, then make the field required in a later migration.

For large tables, test migration duration and locking on a production-like copy first. Take backups and confirm restore procedures before destructive changes such as dropping a column or table.

### 8. Know Drift, Shadow Databases, Existing Databases, and Failed Migrations

`prisma migrate dev` uses a **shadow database** in development to replay migration history, detect schema drift, and warn about possible data loss. It is not used by `migrate deploy` in production.

If your cloud development database cannot create temporary databases, configure a dedicated `SHADOW_DATABASE_URL` in `prisma.config.ts`. It must never point to the same database as `DATABASE_URL`.

```ts
datasource: {
  url: env("DATABASE_URL"),
  shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
},
```

Avoid manual schema changes in a database that Prisma Migrate manages. They cause drift: the database no longer matches your migration history.

When inheriting an existing database:

```bash
npx prisma db pull
```

`db pull` introspects the database into the Prisma schema. Before using migrations on that database, learn Prisma's **baselining** workflow so Prisma records the existing schema without trying to recreate it.

If a production migration fails, stop and inspect the database and migration SQL. Useful commands are:

```bash
npx prisma migrate status
npx prisma migrate resolve --rolled-back migration_name
npx prisma migrate resolve --applied migration_name
```

`migrate resolve` changes Prisma's migration history record; it does not repair the database for you. Use it only after you understand whether the SQL was rolled back, partially applied, or manually completed. For complicated drift investigations, use `prisma migrate diff` and compare the real database, schema, and migration history.

### 9. Separate the Migration Database Role from the Runtime Role

The account that runs migrations may need permission to create tables, alter columns, and add indexes. Your running application normally needs only data permissions such as `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

Use separate database credentials when your infrastructure allows it:

```text
migration role -> schema changes during a controlled deployment step
application role -> normal queries at runtime, with least privilege
```

Keep `DATABASE_URL` and `SHADOW_DATABASE_URL` in environment variables or a secret manager. Never commit a real production connection string.

### 10. Use the Right Read Query Shape

Fetch only fields your code needs. This reduces response size and makes it harder to accidentally return private columns.

```ts
const todos = await client.todo.findMany({
  where: { userId: currentUser.id },
  select: {
    id: true,
    title: true,
    done: true,
    time: true,
  },
  orderBy: { time: "desc" },
});
```

Avoid this N+1 pattern:

```ts
const users = await client.user.findMany();
await Promise.all(users.map((user) => client.todo.findMany({
  where: { userId: user.id },
})));
```

Prefer a nested read with `include`/`select`, or fetch related rows in one query with an `in` filter. Profile relation queries before reaching for Prisma preview features such as `relationLoadStrategy`.

### 11. Use Cursor Pagination for Large, Changing Lists

Offset pagination with `skip` and `take` is simple and useful for small page numbers. It becomes slower at large offsets and can shift while rows are being inserted or deleted.

For a feed or large list, use a unique cursor and request one extra row:

```ts
const pageSize = 20;

const rows = await client.todo.findMany({
  take: pageSize + 1,
  skip: cursorId ? 1 : 0,
  cursor: cursorId ? { id: cursorId } : undefined,
  orderBy: { id: "asc" },
  where: { userId: currentUser.id },
});

const hasNextPage = rows.length > pageSize;
const todos = hasNextPage ? rows.slice(0, pageSize) : rows;
const nextCursor = hasNextPage ? todos.at(-1)?.id : undefined;
```

The cursor field must be unique. Keep `orderBy` deterministic and add an index that supports the `where` plus `orderBy` pattern when the table grows.

### 12. Choose the Smallest Correct Atomic Operation

Use one Prisma query when one query can safely express the change. For user-owned rows, include ownership in that same query:

```ts
const result = await client.todo.updateMany({
  where: {
    id: todoId,
    userId: currentUser.id,
  },
  data: { done: true },
});

if (result.count === 0) {
  throw new Error("Todo not found");
}
```

Use a nested write when the related records are known together:

```ts
await client.user.create({
  data: {
    username: "new-user",
    password: passwordHash,
    age: 24,
    city: "Lucknow",
    todos: {
      create: [{ title: "First todo", description: "Learn nested writes" }],
    },
  },
});
```

Nested writes are transactional. Use `$transaction` when multiple independent queries must all succeed or all fail.

Keep interactive transactions short. Do not put slow API calls, user input, or long loops inside them because they hold a database connection and may create lock contention.

For high-contention operations such as inventory, booking, or money movement, learn transaction isolation levels and retry handling. A serializable transaction can fail with `P2034` under contention; the correct response is usually a short, limited retry of the whole transaction.

Use unique constraints and idempotency keys for requests that might be retried. `upsert` is helpful when its `where` condition is genuinely unique, but it does not replace thinking about concurrency.

### 13. Map Prisma Errors to Useful Application Results

Handle expected database errors close to your data-access code. Do not expose the raw error message or connection details to a user.

```ts
import { Prisma } from "@prisma/client";

try {
  await client.user.create({
    data: {
      username: "utsav",
      password: passwordHash,
      age: 24,
      city: "Lucknow",
    },
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new Error("Username already exists");
    }

    if (error.code === "P2003") {
      throw new Error("Related record does not exist");
    }
  }

  throw error;
}
```

Important codes to recognise while learning:

```text
P2002 -> unique constraint failed
P2003 -> foreign-key constraint failed
P2025 -> expected record was not found
P2034 -> transaction conflict; retry the full transaction when appropriate
```

Validate data before calling Prisma too, but remember that validation does not replace database constraints. Two simultaneous requests can both pass validation; the database constraint is the final protection.

### 14. Use Raw SQL Safely and Only When It Adds Value

Prisma is not a reason to avoid SQL. Use custom SQL in a reviewed migration when you need a PostgreSQL feature Prisma schema does not model.

For application queries, use tagged templates so values are parameterized:

```ts
const rows = await client.$queryRaw`
  SELECT id, title
  FROM "Todo"
  WHERE "userId" = ${currentUser.id}
`;
```

Avoid `$queryRawUnsafe` and `$executeRawUnsafe` with user-controlled values. Parameters protect values, but not SQL identifiers such as dynamic table or column names; use a fixed allow-list for those cases.

Keep custom SQL small, documented, tested, and close to the schema/migration it depends on.

### 15. Test the Database Layer Against a Real, Separate Database

Mocking Prisma is useful for pure unit tests, but it cannot prove a migration, index, relation, or PostgreSQL constraint works.

Integration-test flow:

```text
1. Start a dedicated test PostgreSQL database.
2. Set its test-only DATABASE_URL.
3. Run prisma migrate deploy against that test database.
4. Seed only the data needed by the test.
5. Run tests and clean up only that test database.
```

Never run test resets, seeds, or cleanup commands against development or production by accident. Use visibly different database names and separate environment files or secret variables.

Good Prisma integration tests cover:

```text
unique constraints
required fields and defaults
relation delete behavior
ownership filters
cursor pagination
transaction rollback and retry behavior
the migration path from the previous release
```

### 16. Seed Deliberately

A seed script creates known data; a migration changes database structure. They solve different problems.

Make development and test seeds idempotent with `upsert`, so rerunning them does not create accidental duplicates. Run production seeds only when they are truly required and designed for that environment, such as fixed roles or reference data.

Do not use a seed as a substitute for a data migration. A data backfill required for a schema change belongs in the reviewed deployment/migration plan.

### 17. Observe Prisma and the Database in Production

Start with Prisma error and warning logs:

```ts
const client = new PrismaClient({
  log: ["error", "warn"],
});
```

Use query logging briefly during local debugging or controlled profiling. Query logs can be noisy and may contain sensitive values, so do not blindly enable them everywhere.

Monitor both Prisma and PostgreSQL:

```text
connection pool usage and connection failures
slow queries and EXPLAIN ANALYZE results
database CPU, memory, storage, locks, and replication/backup health
Prisma errors and transaction conflicts
which migration version has been deployed
```

The `_prisma_migrations` table records applied migrations. `prisma migrate status` helps compare that history with the migration files in your release.

### 18. Production Release Checklist

Before releasing a Prisma schema change, check this list:

```text
[ ] The Prisma schema, migration folder, generated client, and application code agree.
[ ] The migration SQL was reviewed and tested on a production-like copy for risky changes.
[ ] The change is backward compatible, or deployment is coordinated using expand-backfill-contract.
[ ] A backup and tested restore path exist for destructive changes.
[ ] One controlled job will run prisma migrate deploy.
[ ] Runtime and migration database credentials have appropriate permissions.
[ ] New queries have the necessary indexes and do not return unnecessary private fields.
[ ] Ownership or tenant filters are present in every user-scoped query.
[ ] Integration tests run against a separate database after migrations are applied.
[ ] Logs and monitoring will make migration failures, connection problems, and slow queries visible.
```

### Official Prisma References

- [Prisma Migrate overview](https://www.prisma.io/docs/orm/prisma-migrate)
- [Production best practices](https://www.prisma.io/docs/orm/more/best-practices)
- [Shadow databases and schema drift](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database)
- [Integration testing with Prisma](https://www.prisma.io/docs/orm/prisma-client/testing/integration-testing)
- [Query optimization](https://www.prisma.io/docs/orm/v6/prisma-client/queries/query-optimization-performance)

### Honest Summary

This README now covers the Prisma-specific path from a learning project to production: schema integrity, data access, connections, migrations, live schema changes, query performance, transactions, raw SQL, testing, and operations.

It deliberately does not teach non-Prisma areas such as login screens, HTTP APIs, frontend design, or cloud hosting. Those are separate subjects; the database layer above is the Prisma knowledge you need before trusting real application data to it.


## 34. Commands To Remember

```bash
# Read-only checks
npx prisma version
npx prisma validate
npx prisma format --check
npx prisma migrate status

# Local schema and client work
npx prisma format                    # writes schema formatting
npx prisma generate                  # writes generated client artifacts
npm run dev
npx prisma migrate dev --name migration_name
npx prisma studio

# Create a migration but inspect/edit its SQL before applying it locally
npx prisma migrate dev --create-only --name migration_name

# Existing database: preview introspection before rewriting schema
npx prisma db pull --print
npx prisma db pull                   # overwrites schema.prisma; commit or back up first

# Seed configured development/test data
npx prisma db seed

# Deletes all data: disposable local development database only
npx prisma migrate reset

# Fast schema prototyping only: does not create migration files; never production
npx prisma db push

# Potential data loss: only after understanding the warning and targeting a disposable database
npx prisma db push --accept-data-loss

# Controlled production deployment step
npx prisma migrate deploy

# Migration incident investigation: inspect differences or record a known migration state
npx prisma migrate diff --help
npx prisma migrate resolve --rolled-back migration_name
npx prisma migrate resolve --applied migration_name

# Run reviewed SQL outside Prisma migration history; treat as a database-changing operation
npx prisma db execute --file ./script.sql
```

Use `migrate dev` only for development and `migrate deploy` only for already committed migration files in staging/production. `migrate diff` source flags differ across Prisma major versions, so start with `npx prisma migrate diff --help` and use the CLI version installed by the project. `migrate resolve` changes the migration history record but does not repair the database; use it only during a diagnosed migration incident. In newer Prisma majors, `migrate dev` and `db push` may not run `generate` automatically, so explicitly run `npx prisma generate` after a schema change when your project needs generated client updates.


## 35. Mental Model

Think like this:

```text
schema.prisma     = database shape
migrations        = database change history
Prisma Client     = TypeScript query tool
Prisma Studio     = visual database editor
DATABASE_URL      = database connection string
```

The main Prisma skill is learning how your schema turns into typed query methods.

Example:

```prisma
model User {
  id       Int    @id @default(autoincrement())
  username String @unique
}
```

Becomes:

```ts
client.user.create()
client.user.findMany()
client.user.findUnique()
client.user.update()
client.user.delete()
```

That is the core idea of Prisma.


## Resources and Repositories

Use this section as a map when you want to go deeper without searching randomly.

### Official Prisma Resources

- [Prisma ORM documentation](https://www.prisma.io/docs/orm): the main starting point for schema, queries, migrations, and deployment.
- [Prisma 6 documentation](https://www.prisma.io/docs/orm/v6): useful while this project remains on Prisma 6.
- [Prisma Client queries](https://www.prisma.io/docs/orm/prisma-client/queries): CRUD, filters, relations, pagination, transactions, and raw SQL.
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate): migrations, deployment, drift, baselining, and recovery.
- [Prisma best practices](https://www.prisma.io/docs/orm/more/best-practices): schema design, performance, security, and production patterns.
- [Prisma guides](https://www.prisma.io/docs/guides): framework, database, and deployment guides.
- [Integration testing with Prisma](https://www.prisma.io/docs/orm/prisma-client/testing/integration-testing): test Prisma against a dedicated real database.
- [Prisma Discord](https://pris.ly/discord): ask questions after you have a small reproducible example.

### Repositories Worth Exploring

- [prisma/prisma](https://github.com/prisma/prisma): Prisma ORM source, release notes, issues, and discussions.
- [prisma/prisma-examples](https://github.com/prisma/prisma-examples): ready-to-run projects for frameworks, databases, deployments, and Prisma features.
- [prisma/language-tools](https://github.com/prisma/language-tools): Prisma VS Code extension and language tooling.
- [prisma/prisma-engines](https://github.com/prisma/prisma-engines): low-level engine code; advanced reading only.
- [prisma/deployment-example-vercel](https://github.com/prisma/deployment-example-vercel): a Prisma deployment example for Vercel.

### PostgreSQL Resources That Help Prisma Users

Prisma generates database queries, but PostgreSQL still controls constraints, indexes, locks, query plans, and transactions.

- [PostgreSQL documentation](https://www.postgresql.org/docs/): the primary SQL and database reference.
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html): measure query plans before adding indexes.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html): learn primary keys, foreign keys, unique constraints, and checks.

### Recommended Learning Order

```text
1. Finish the CRUD, relation, migration, and seed sections in this file.
2. Build a Todo API with User and Todo models.
3. Add select/include, filters, error handling, and pagination.
4. Read migration.sql files and make a safe schema change.
5. Add tests against a separate PostgreSQL database.
6. Study the production checklist.
7. Read one focused example from prisma/prisma-examples.
```

### Projects To Practise

```text
Todo API        -> users, todos, ownership checks, cursor pagination
Blog API        -> users, posts, comments, tags, drafts
Store API       -> products, orders, order items, stock, transactions
Team workspace  -> organizations, members, roles, tenant-scoped queries
Existing DB     -> create PostgreSQL tables, use prisma db pull, learn baselining
```

For every project, practise schema design, migrations, relations, indexes based on real queries, transactions, error mapping, test database setup, and safe deployment.

### How To Learn From a Repository

```text
1. Read the README; identify its database provider and Prisma version.
2. Read prisma/schema.prisma and describe each model and relation yourself.
3. Check package.json for generate, migrate, seed, and test scripts.
4. Follow one API route or service call down to Prisma Client.
5. Read one migration.sql file and compare it with the schema change.
6. Make a small local change and inspect it in Prisma Studio.
```

### Version Reminder

Do not copy a Prisma 7 configuration into this Prisma 6 project without reading the upgrade guide. Your current `prisma-client-js` generator is valid for Prisma 6. Treat a major Prisma upgrade as a separate tested task: update packages, generate the client, check migrations, and run application tests.
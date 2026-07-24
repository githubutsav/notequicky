---
title: "04. Testing and Data Seeding"
---

## 23. Transactions

A transaction means:

- Run multiple database operations together.
- If one fails, all fail.
- If all pass, all save.

Example:

```ts
await client.$transaction([
  client.user.create({
    data: {
      username: "transaction_user",
      password: "secret",
      age: 30,
      city: "mumbai",
    },
  }),
  client.todo.create({
    data: {
      title: "Transaction todo",
      description: "Created inside transaction",
      done: false,
      userId: 1,
    },
  }),
]);
```

Important: the array form is good when the operations do not need data from each other.
In the example above, `userId: 1` only works if a user with id `1` already exists.
The todo cannot use the id from the user created in the previous item of the same array.

Interactive transaction:

```ts
await client.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      username: "interactive_user",
      password: "secret",
      age: 28,
      city: "pune",
    },
  });

  await tx.todo.create({
    data: {
      title: "Todo for interactive user",
      description: "Created after user",
      done: false,
      userId: user.id,
    },
  });
});
```

Use the interactive transaction when one query depends on the result of another query.
Here the todo uses `user.id`, so it belongs to the exact user that was just created.


## 24. Migrations

Migration means:

- You changed `schema.prisma`.
- Prisma creates SQL to update your database.
- The SQL is stored in `prisma/migrations`.

### Development Workflow: Change Your Database Safely

Use this workflow whenever you add, remove, or change a model, field, relation, index, or constraint.

1. Change `prisma/schema.prisma`.
2. Format and check the schema:

```bash
npx prisma format
```

3. Create and apply a development migration with a clear name:

```bash
npx prisma migrate dev --name add_todo_priority
```

4. Regenerate Prisma Client after schema changes:

```bash
npx prisma generate
```

5. Test your code, then commit both `prisma/schema.prisma` and the new folder inside `prisma/migrations/`.

`migrate dev` creates SQL migration files and applies them to your development database. A meaningful migration name makes the history easy to understand later.

### Commands and When To Use Them

| Command | Use it for | Important note |
| --- | --- | --- |
| `npx prisma migrate dev --name name_here` | Creating and applying a new migration on your own development database | Use after changing the schema. |
| `npx prisma generate` | Updating the TypeScript client types and methods | Run after schema or generator changes. |
| `npx prisma migrate status` | Checking whether migrations are applied and whether Prisma sees a problem | Read-only check; safe before deploying. |
| `npx prisma migrate deploy` | Applying existing committed migrations to staging or production | Does not create a new migration. |
| `npx prisma migrate reset` | Starting over on a disposable development database | Deletes all database data. Never use it in production. |
| `npx prisma db push` | Fast prototyping when migration history does not matter | Does not create migration files; do not use it for a shared or production database. |

### Working With Existing Migrations

- Do not edit or delete a migration that has already been applied to a shared, staging, or production database.
- If you need to correct an earlier change, change `schema.prisma` and create a new migration.
- When you pull a teammate's or another branch's migration files, run `npx prisma migrate dev` on your development database, then run `npx prisma generate`.
- Before deploying, commit the schema and migration folder together. Your database change is incomplete if one is missing.
- Use `npx prisma migrate deploy` in staging or production. Do not use `migrate dev` there.

### Reset Database and Apply Migrations Again

```bash
npx prisma migrate reset
```

Use this carefully because it deletes existing data.

For this learning project, prefer `migrate dev` over `db push`, because migration files teach you exactly how the schema becomes SQL.


## 25. Prisma Studio

Open a browser UI for your database:

```bash
npx prisma studio
```

Use Prisma Studio to:

- See users
- See todos
- Add rows manually
- Edit rows
- Understand relations visually


## 26. Seeding

Seeding means adding sample data automatically.

Example idea:

```ts
await client.user.create({
  data: {
    username: "seed_user",
    password: "secret",
    age: 20,
    city: "lucknow",
    todos: {
      create: {
        title: "Seeded todo",
        description: "Created from seed script",
        done: false,
      },
    },
  },
});
```

For this project, a real seed file could be:

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function main() {
  await client.user.upsert({
    where: {
      username: "seed_user",
    },
    update: {},
    create: {
      username: "seed_user",
      password: "secret",
      age: 20,
      city: "lucknow",
      todos: {
        create: {
          title: "Seeded todo",
          description: "Created from seed script",
          done: false,
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.$disconnect();
  });
```

Then configure Prisma to run that file.

Your project already has `prisma.config.ts`, so add a `seed` command inside `migrations`:

```ts
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Because this project does not currently have `tsx` installed, install it first:

```bash
npm install -D tsx
```

Run the seed:

```bash
npx prisma db seed
```

`npx prisma migrate reset` can also run the seed after resetting the database.
Use reset carefully because it deletes data.


## 27. Enums

Enums are fixed allowed values.

Example:

```prisma
enum TodoStatus {
  PENDING
  DONE
  CANCELLED
}

model Todo {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  status      TodoStatus @default(PENDING)
}
```

Use enum when a field should only allow specific values.


## 28. Raw SQL

Prisma lets you run raw SQL when needed.

```ts
const result = await client.$queryRaw`SELECT * FROM "User"`;
console.log(result);
```

Use Prisma Client methods first. Use raw SQL only when Prisma Client cannot easily express the query.


## 29. Error Handling

Duplicate username can throw an error because `username` is unique.

Simple error handling:

```ts
try {
  await client.user.create({
    data: {
      username: "utsav",
      password: "secret",
      age: 24,
      city: "lucknow",
    },
  });
} catch (error) {
  console.error("Something went wrong:", error);
}
```

For practice, use `upsert` to avoid duplicate create errors.


## 30. Best Learning Order

Follow this order:

1. Schema models
2. Migrations
3. Prisma Client setup
4. `create`
5. `findMany`
6. `findUnique`
7. `findFirst`
8. Filtering
9. `update`
10. `delete`
11. Relations
12. `include`
13. `select`
14. Nested writes
15. Ordering
16. Pagination
17. Counting
18. Transactions
19. Indexes and constraints
20. Enums
21. Seeding
22. Prisma Studio
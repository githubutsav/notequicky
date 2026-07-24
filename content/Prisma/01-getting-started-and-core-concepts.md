---
title: "01. Getting Started and Core Concepts"
---

# Prisma Learning Notes

This project is a small TypeScript + Prisma + PostgreSQL practice project.

Current models:

- `User`
- `Todo`
- One user can have many todos.
- Each todo belongs to one user.

Use this README as your Prisma revision notebook.


## Current Project State

This section explains what already exists in this project.

### Existing Tech Stack

```text
Node.js       Runs the project
TypeScript    Lets you write typed JavaScript
Prisma        ORM for database queries
PostgreSQL    Database provider
```

### Existing Package Script

In `package.json`, this script already exists:

```json
{
  "scripts": {
    "dev": "tsc -b && node ./dist/index.js"
  }
}
```

Meaning:

- `tsc -b` compiles TypeScript into JavaScript.
- `node ./dist/index.js` runs the compiled code.
- Run it with:

```bash
npm run dev
```

### Existing Prisma Generator

In `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Meaning:

- Prisma generates a JavaScript/TypeScript client.
- That generated client is used through `@prisma/client`.
- This is why `src/index.ts` can use:

```ts
import { PrismaClient } from "@prisma/client";
```

### Existing Datasource

In `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
}
```

Meaning:

- Your project is using PostgreSQL.
- The database connection URL is loaded from `prisma.config.ts`.

In `prisma.config.ts`, this already exists:

```ts
datasource: {
  url: env("DATABASE_URL"),
}
```

Meaning:

- Prisma reads `DATABASE_URL` from your environment.
- `DATABASE_URL` is the connection string for your database.

### Existing `User` Model

```prisma
model User{
  id            Int         @default(autoincrement()) @id
  username      String      @unique
  password      String
  age           Int
  city          String
  todos         Todo[]
}
```

Meaning:

- `id` is the primary key.
- `id` is automatically increased: `1`, `2`, `3`, and so on.
- `username` must be unique.
- `password` stores the user's password.
- `age` stores a number.
- `city` stores text.
- `todos` means one user can have many todos.

Security note:

- Plain text passwords are okay only in this learning project.
- Real apps must hash passwords before saving them.
- Common choices are `bcrypt` or `argon2`.

Current learning point:

- You already know how to create a model.
- Next, learn how each field maps to a database column.

### Existing `Todo` Model

```prisma
model Todo{
  id            Int         @default(autoincrement()) @id
  title         String
  description   String
  done          Boolean
  userId        Int
  time          DateTime    @default(now())
  user          User        @relation(fields:[userId],references:[id])
}
```

Meaning:

- `id` is the primary key.
- `title` stores the todo title.
- `description` stores more detail.
- `done` stores `true` or `false`.
- `userId` stores the id of the user who owns this todo.
- `time` automatically stores the creation time.
- `user` connects this todo to the `User` model.

Current learning point:

- You already have a one-to-many relation.
- One `User` can have many `Todo` records.
- Each `Todo` belongs to one `User`.

### Existing Relation

The relation is made from both sides:

```prisma
// User side
todos Todo[]

// Todo side
userId Int
user   User @relation(fields: [userId], references: [id])
```

Meaning:

- `Todo.userId` stores the foreign key.
- `Todo.user` tells Prisma how to join Todo to User.
- `User.todos` lets Prisma fetch all todos for a user.

Mental picture:

```text
User
  id = 1
  username = "utsav"

Todo
  id = 1
  title = "Learn Prisma"
  userId = 1
```

Here, `Todo.userId = 1` points to `User.id = 1`.

### Existing Migrations

Your project already has migrations inside:

```text
prisma/migrations/
```

Migrations are the history of your database changes.

From your project, these migration ideas already exist:

```text
initialize_prisma
remigrated_and_added_city_column
todo_model
added_date_time_in_todos_table
```

Meaning:

- You initialized Prisma.
- You added or changed the `User` model.
- You added the `Todo` model.
- You added a date/time field to todos.

Current learning point:

- Open each `migration.sql` file later.
- Read the SQL and compare it with `schema.prisma`.
- This teaches how Prisma schema becomes real database tables.

### Existing `src/index.ts`

Your current code:

```ts
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function createUser(){
await client.user.create({
    data: {
        username: "utsav",
        password: "jfij",
        age: 34,
        city: "lucknow"

    }
})
}
createUser();
```

Meaning:

- You imported Prisma Client.
- You created a Prisma Client instance.
- You wrote a `createUser` function.
- You inserted one user into the database.

Important issue:

- `username` is unique.
- Running this code again with `username: "utsav"` can fail because that username may already exist.
- The example password is plain text only because this project is focused on Prisma basics.
- In a real app, never store plain text passwords.

Better practice version:

```ts
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function main() {
  const user = await client.user.upsert({
    where: {
      username: "utsav",
    },
    update: {
      age: 34,
      city: "lucknow",
    },
    create: {
      username: "utsav",
      password: "jfij",
      age: 34,
      city: "lucknow",
    },
  });

  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await client.$disconnect();
  });
```

Why this is better:

- `upsert` avoids duplicate username errors.
- `.catch()` shows errors.
- `$disconnect()` closes the database connection.

### What You Have Already Learned

You already touched these Prisma topics:

- Installing Prisma
- Running `npx prisma init`
- Creating `schema.prisma`
- Configuring a Prisma Client generator
- Choosing PostgreSQL as a datasource
- Connecting PostgreSQL
- Creating models
- Using `@id`
- Using `@default`
- Using `@unique`
- Creating a relation
- Running migrations
- Importing `PrismaClient`
- Creating a row with `create`

### What Is Still Missing For Practice

You still need to practice:

- `findMany`
- `findUnique`
- `findFirst`
- `update`
- `delete`
- `upsert`
- `include`
- `select`
- nested writes
- filtering
- sorting
- pagination
- transactions
- Prisma Studio
- seeding
- indexes
- enums


## 1. What Prisma Does

Prisma helps your TypeScript code talk to your database.

Instead of writing SQL like this:

```sql
SELECT * FROM "User";
```

You write TypeScript like this:

```ts
await client.user.findMany();
```

Prisma gives you:

- A schema file: `prisma/schema.prisma`
- Migrations: database change history
- Prisma Client: TypeScript code for querying the database
- Prisma Studio: browser UI to see and edit data


## 2. Important Files

```text
prisma/schema.prisma       Defines database models
prisma/migrations/         Stores database migration history
prisma.config.ts           Loads Prisma config and DATABASE_URL
src/index.ts               Place to write Prisma Client practice code
package.json               Contains scripts and dependencies
```


## 3. Prisma Schema Basics

Your schema currently has this generator:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Meaning:

- Generate Prisma Client for JavaScript/TypeScript.
- This lets you import `PrismaClient` from `@prisma/client`.

### Is This Generator Correct and Up To Date?

Yes, this is correct for the Prisma 6 setup currently used by this project:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

It matches the existing import in `src/index.ts`:

```ts
import { PrismaClient } from "@prisma/client";
```

`prisma-client-js` is still supported, so do not change it just because it looks old.

For new Prisma 7 projects, Prisma recommends the newer ESM-first generator:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

That newer generator requires an `output` path and changes the import path in your TypeScript code. For example:

```ts
import { PrismaClient } from "../generated/prisma/client";
```

Keep `prisma-client-js` while learning with this project. Later, make a separate practice branch to try `prisma-client`; do not mix the new generator with the old `@prisma/client` import.

Your datasource:

```prisma
datasource db {
  provider = "postgresql"
}
```

Meaning:

- The database is PostgreSQL.
- The database URL is currently loaded from `prisma.config.ts`.

This is also correct. The datasource name `db` is a common convention; it could have another name, but `db` is clear and should stay as it is.

Your connection URL is intentionally not inside `schema.prisma` because `prisma.config.ts` provides it instead:

```ts
datasource: {
  url: env("DATABASE_URL"),
}
```

Because `prisma.config.ts` calls `env("DATABASE_URL")`, Prisma CLI commands need this variable to be set before Prisma can load the config. Put a real PostgreSQL connection string in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

In many Prisma projects, you may also see:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```


## 4. Your Models

```prisma
model User {
  id       Int    @default(autoincrement()) @id
  username String @unique
  password String
  age      Int
  city     String
  todos    Todo[]
}

model Todo {
  id          Int      @default(autoincrement()) @id
  title       String
  description String
  done        Boolean
  userId      Int
  time        DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

Meaning:

- `User.id` is the primary key.
- `username` must be unique.
- `User.todos` means one user has many todos.
- `Todo.userId` stores the related user's id.
- `Todo.user` defines the relation.


## 5. Useful Schema Attributes

### `@id`

Marks a field as the primary key.

```prisma
id Int @id @default(autoincrement())
```

### `@default`

Gives a field a default value.

```prisma
done Boolean @default(false)
```

### `@unique`

Prevents duplicate values.

```prisma
username String @unique
```

### `@relation`

Connects two models.

```prisma
user User @relation(fields: [userId], references: [id])
```

### `@updatedAt`

Automatically updates a timestamp whenever the row changes.

```prisma
updatedAt DateTime @updatedAt
```

### Optional field with `?`

Allows a field to be empty.

```prisma
description String?
```

### Model-level index

Helps speed up searches.

```prisma
@@index([userId])
```

### Compound unique constraint

Makes a combination unique.

```prisma
@@unique([username, city])
```


## 6. Recommended Improved Schema For Learning

You can later change your models to this:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  age       Int
  city      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  todos     Todo[]

  @@index([city])
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  done        Boolean  @default(false)
  userId      Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

After changing schema, run:

```bash
npx prisma migrate dev --name improve_user_todo_models
```
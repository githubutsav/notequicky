---
title: "02. Schema Definition and Data Modeling"
---

## 7. Prisma Client Setup

In `src/index.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function main() {
  // write practice code here
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await client.$disconnect();
  });
```

Why `$disconnect()` matters:

- Prisma opens a database connection.
- At the end of your script, close it cleanly.


## 8. Create

Create one user:

```ts
const user = await client.user.create({
  data: {
    username: "utsav",
    password: "secret",
    age: 24,
    city: "lucknow",
  },
});

console.log(user);
```

Important:

- `username` is unique.
- Running this twice with the same username will fail.


## 9. Find Many

Get all users:

```ts
const users = await client.user.findMany();
console.log(users);
```

Get all todos:

```ts
const todos = await client.todo.findMany();
console.log(todos);
```


## 10. Find Unique

Use `findUnique` with unique fields like `id` or `username`.

```ts
const user = await client.user.findUnique({
  where: {
    username: "utsav",
  },
});

console.log(user);
```

Or:

```ts
const user = await client.user.findUnique({
  where: {
    id: 1,
  },
});
```


## 11. Find First

Use `findFirst` when the field is not unique.

```ts
const user = await client.user.findFirst({
  where: {
    city: "lucknow",
  },
});

console.log(user);
```


## 12. Filtering

Find users older than 18:

```ts
const users = await client.user.findMany({
  where: {
    age: {
      gt: 18,
    },
  },
});
```

Common filters:

```ts
gt      // greater than
gte     // greater than or equal
lt      // less than
lte     // less than or equal
contains
startsWith
endsWith
in
not
```

Example:

```ts
const users = await client.user.findMany({
  where: {
    city: {
      contains: "luck",
      mode: "insensitive",
    },
  },
});
```


## 13. Update

Update one user:

```ts
const updatedUser = await client.user.update({
  where: {
    username: "utsav",
  },
  data: {
    age: 25,
    city: "delhi",
  },
});

console.log(updatedUser);
```

Mark a todo as done:

```ts
const todo = await client.todo.update({
  where: {
    id: 1,
  },
  data: {
    done: true,
  },
});
```


## 14. Delete

Delete one todo:

```ts
await client.todo.delete({
  where: {
    id: 1,
  },
});
```

Delete many completed todos:

```ts
await client.todo.deleteMany({
  where: {
    done: true,
  },
});
```

Be careful with `deleteMany`. An empty `where` deletes all rows in that table.
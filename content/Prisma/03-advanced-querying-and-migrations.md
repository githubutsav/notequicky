---
title: "03. Advanced Querying and Migrations"
---

## 15. Upsert

`upsert` means:

- If it exists, update it.
- If it does not exist, create it.

This is useful with unique fields.

```ts
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

console.log(user);
```

This avoids duplicate username errors while practicing.


## 16. Relations

Your relationship:

```text
User 1 ---- many Todo
Todo many ---- 1 User
```

Create a todo for an existing user:

```ts
const todo = await client.todo.create({
  data: {
    title: "Learn Prisma relations",
    description: "Practice user and todo relation",
    done: false,
    userId: 1,
  },
});
```

Better: connect by relation:

```ts
const todo = await client.todo.create({
  data: {
    title: "Learn connect",
    description: "Connect todo to existing user",
    done: false,
    user: {
      connect: {
        username: "utsav",
      },
    },
  },
});
```


## 17. Include

Use `include` to load related data.

Get users with todos:

```ts
const users = await client.user.findMany({
  include: {
    todos: true,
  },
});

console.log(users);
```

Get todos with user:

```ts
const todos = await client.todo.findMany({
  include: {
    user: true,
  },
});
```


## 18. Select

Use `select` to choose fields.

```ts
const users = await client.user.findMany({
  select: {
    id: true,
    username: true,
    city: true,
  },
});
```

Select user fields and todo fields:

```ts
const users = await client.user.findMany({
  select: {
    username: true,
    todos: {
      select: {
        title: true,
        done: true,
      },
    },
  },
});
```

Simple rule:

- `include` loads relations.
- `select` chooses exact fields.


## 19. Nested Writes

Create a user and todos together:

```ts
const user = await client.user.create({
  data: {
    username: "ram",
    password: "secret",
    age: 22,
    city: "delhi",
    todos: {
      create: [
        {
          title: "Learn nested writes",
          description: "Create related data together",
          done: false,
        },
        {
          title: "Practice Prisma Studio",
          description: "Open and inspect data",
          done: false,
        },
      ],
    },
  },
  include: {
    todos: true,
  },
});

console.log(user);
```


## 20. Ordering

Newest todos first:

```ts
const todos = await client.todo.findMany({
  orderBy: {
    time: "desc",
  },
});
```

Youngest users first:

```ts
const users = await client.user.findMany({
  orderBy: {
    age: "asc",
  },
});
```


## 21. Pagination

Get first 10 todos:

```ts
const todos = await client.todo.findMany({
  take: 10,
  skip: 0,
});
```

Get next 10:

```ts
const todos = await client.todo.findMany({
  take: 10,
  skip: 10,
});
```


## 22. Counting

Count users:

```ts
const count = await client.user.count();
console.log(count);
```

Count incomplete todos:

```ts
const count = await client.todo.count({
  where: {
    done: false,
  },
});
```
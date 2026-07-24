# TypeScript Learning Notes

TypeScript is JavaScript with a static type system. It catches many mistakes before code runs, but types are erased when compiled: TypeScript does not validate API input, secure an application, or change JavaScript runtime behavior.

```text
TypeScript source (.ts) -> type-check / compile -> JavaScript -> Node.js or browser
```

Learn sections 1-9 first. Use strict mode, avoid `any`, and validate every value that crosses a runtime boundary.

## 1. Setup and Mental Model

Install TypeScript locally in a project, then type-check with its project configuration.

```sh
npm install -D typescript
npx tsc --init
npx tsc --noEmit
```

Start with a strict configuration. Exact options depend on the app, but this is a strong baseline:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

`strict` enables a family of useful checks. `noUncheckedIndexedAccess` makes indexed reads potentially `undefined`; `exactOptionalPropertyTypes` distinguishes an omitted property from a property explicitly set to `undefined`. Turn strict settings on early for new projects; adopt them gradually in existing JavaScript projects.

Use `tsx` or a configured build tool to run TypeScript during development. Use `tsc --noEmit` in CI to type-check; a bundler or runtime may handle JavaScript output. Node ESM projects commonly use `"type": "module"` in `package.json` with `NodeNext` settings.

## 2. Inference and Everyday Types

Let TypeScript infer obvious values. Add annotations at function boundaries, public APIs, complex objects, and values that otherwise become too broad.

```ts
const username = "Utsav"; // "Utsav" literal in a const context
let score = 0;             // number
let active: boolean = true;

const tags: string[] = ["javascript", "typescript"];
const point: [number, number] = [28.6, 77.2];

type User = {
  id: string;
  name: string;
  city?: string;
};

const user: User = { id: "u1", name: "Utsav" };
```

Use `readonly` for values your code should not mutate. It is a compile-time restriction, not a frozen runtime object.

```ts
type Todo = {
  readonly id: string;
  title: string;
  completed: boolean;
};
```

Use a union when a value can be one of a small set of types. Prefer literal unions to a TypeScript `enum` unless you specifically need enum runtime behavior.

```ts
type Status = "draft" | "published" | "archived";
const status: Status = "draft";

const roles = ["user", "admin"] as const;
type Role = (typeof roles)[number]; // "user" | "admin"
```

## 3. Functions and Narrowing

Type parameters and return types make function contracts clear. A function that does not return a useful value returns `void`.

```ts
function add(first: number, second: number): number {
  return first + second;
}

function formatUser(user: User): string {
  return user.city ? `${user.name} (${user.city})` : user.name;
}
```

Narrow a union before using members that are not shared by every option.

```ts
function formatId(value: string | number): string {
  if (typeof value === "number") return value.toFixed(0);
  return value.toUpperCase();
}
```

Use discriminated unions for states with different data. The `kind` field lets TypeScript narrow safely and makes impossible states harder to represent.

```ts
type LoadState<T> =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: T }
  | { kind: "error"; message: string };

function renderTodos(state: LoadState<Todo[]>): string {
  switch (state.kind) {
    case "success": return `${state.data.length} todos`;
    case "error": return state.message;
    case "idle": return "Not loaded";
    case "loading": return "Loading…";
  }
}
```

Use an exhaustive check when every case must be handled:

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
```

## 4. `unknown`, `any`, `never`, and Assertions

`any` disables meaningful checking and spreads unsafety. Prefer `unknown` for a value whose shape is not yet known, then validate or narrow it.

```ts
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null
    && "id" in value && typeof value.id === "string"
    && "name" in value && typeof value.name === "string";
}

const payload: unknown = JSON.parse('{"id":"u1","name":"Utsav"}');
if (isUser(payload)) {
  console.log(payload.name);
}
```

`never` is a value that cannot occur, such as a function that always throws. `as SomeType` is an assertion: it tells the compiler to trust you without checking the runtime value. Use assertions sparingly; they are not conversion or validation.

```ts
const title = document.querySelector("#title"); // Element | null
if (!(title instanceof HTMLInputElement)) {
  throw new Error("Missing title input");
}
title.value; // safely narrowed
```

## 5. Objects, `keyof`, and Utility Types

`keyof` produces a union of an object's keys. Indexed access gets the type at a key. Use generics to preserve the relationship between input and output.

```ts
function getProperty<ObjectType, Key extends keyof ObjectType>(
  object: ObjectType,
  key: Key,
): ObjectType[Key] {
  return object[key];
}

getProperty(user, "name"); // string
```

Useful built-in utility types:

```ts
type NewTodo = Omit<Todo, "id">;
type TodoPatch = Partial<Pick<Todo, "title" | "completed">>;
type TodoPreview = Pick<Todo, "id" | "title">;
type TodoById = Record<string, Todo>;
type RequiredUser = Required<User>;
```

Mapped types transform properties; conditional types choose a type based on another type. Learn them after everyday generics, not before.

```ts
type Nullable<T> = { [Key in keyof T]: T[Key] | null };
type ApiData<T> = T extends Promise<infer Result> ? Result : T;
```

Use overloads only when the return type truly changes with the input shape. Often a generic or a union is easier to understand.

## 6. Generics and Collections

Generics let a function, class, or type work with many types while preserving type information.

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

const firstTodo = first<Todo>([]); // Todo | undefined

type ApiResponse<T> = {
  data: T;
  requestId: string;
};
```

Constrain a generic when it needs a capability:

```ts
function withId<T extends { id: string }>(item: T): T & { seen: true } {
  return { ...item, seen: true };
}
```

## 7. Classes, Modules, and Third-Party Types

TypeScript classes use normal JavaScript runtime classes. Interfaces describe object shapes and can be extended or implemented; type aliases are more flexible for unions and computed types. Prefer whichever produces the clearest domain model.

```ts
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(value: T): Promise<T>;
}
```

Use `import type` for imports used only as types when `verbatimModuleSyntax` is enabled.

```ts
import type { User } from "./user.js";
import { findUser } from "./user.js";
```

Packages can include their own declarations or use community `@types/package-name` declarations. A `.d.ts` file declares types for JavaScript code but does not create runtime code. When importing JavaScript, start with `unknown` at uncertain boundaries and add declarations gradually.

## 8. Browser, Node, and Async Code

The DOM may return `null`; check it before use. Fetch JSON is untyped at runtime, so treat it as `unknown` and validate it.

```ts
async function loadTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid todo response");
  return data.filter(isTodo);
}

function isTodo(value: unknown): value is Todo {
  return typeof value === "object" && value !== null
    && "id" in value && typeof value.id === "string"
    && "title" in value && typeof value.title === "string"
    && "completed" in value && typeof value.completed === "boolean";
}
```

In Node, include Node's types and use `node:` imports. Keep runtime configuration validation near application startup.

```sh
npm install -D @types/node
```

```ts
import { readFile } from "node:fs/promises";

const text = await readFile("README.md", "utf8");
```

## 9. TypeScript with Prisma

Prisma generates types from the schema. Let the generated client infer query result types where practical; use `select` to limit both data returned and the resulting type.

```ts
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});

type UserListItem = (typeof users)[number];
```

Do not expose a database model automatically as an API contract. Validate request input before calling Prisma, enforce authorization separately, and define a response shape deliberately. See `Prisma.md` for query, migration, and production details.

## 10. Production TypeScript

Use strict compiler options, `tsc --noEmit`, linting, tests, and a production build in CI. Type-checking complements tests; it does not prove behavior or catch malformed external input.

Good production habits:

- Keep `any` out of application code; use `unknown` plus validation at boundaries.
- Prefer discriminated unions for UI and business-process states.
- Avoid non-null assertions (`value!`) and broad casts (`as SomeType`) unless an invariant is checked nearby.
- Keep generated code out of manual edits and regenerate types after schema changes.
- Run migrations, type checks, tests, and builds in an environment close to production.
- Keep emitted JavaScript, module format, and Node version aligned between local development and deployment.

## 11. Common Compiler Commands

```sh
npx tsc --init            # Writes tsconfig.json
npx tsc --noEmit          # Type-check without writing output
npx tsc --watch --noEmit  # Keep type-checking while files change
npx tsc                   # May write JavaScript and declaration output
npx tsx src/index.ts      # Run TypeScript in development when tsx is installed
```

## 12. Learning Order and Practice

```text
1. Convert a small JavaScript utility: annotations, inference, strict errors.
2. Model a Todo: object types, optional properties, unions, readonly fields.
3. Build a form: DOM null checks, FormData, unknown input validation.
4. Build an API client: async functions, discriminated loading states, runtime response guards.
5. Convert a Node CLI: Node imports, environment configuration, error handling.
6. Build a Prisma Todo API: validated input, select types, authorization, tests.
7. Add CI: type-check, lint, tests, and production build.
```

## 13. Interview Questions and Answers

### 1. Does TypeScript run in the browser or Node?

No. TypeScript is checked and usually compiled to JavaScript before the runtime executes it. Some development tools transpile it on demand, but the runtime still receives JavaScript.

### 2. What is the difference between `any` and `unknown`?

`any` opts out of checking. `unknown` accepts any value but requires narrowing before it can be used as a specific type, making it the safer boundary type.

### 3. What is a type guard?

A type guard is a runtime check that also informs TypeScript of a narrower type, such as `typeof value === "string"` or a function returning `value is User`.

### 4. What is a discriminated union?

It is a union whose members share a literal tag such as `kind`. Checking that tag safely selects the matching shape.

### 5. Why is `strict` important?

It enables checks that catch common null, implicit-any, and unsafe assignment mistakes. It makes types more accurate and reduces the number of hidden assumptions in code.

### 6. What does `as` do?

It is a compile-time assertion, not a runtime conversion or validation. It should be avoided when a real check can establish the same fact.

### 7. Interface or type alias?

Both describe shapes. Interfaces are convenient for extendable object contracts; type aliases handle unions, primitives, tuples, and computed types. Choose clarity and consistency.

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html): the main official learning resource.
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/): compiler-option explanations.
- [TypeScript Playground](https://www.typescriptlang.org/play): test a small type idea quickly.
- [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html): version-specific features and changes.
- [Node.js TypeScript guide](https://nodejs.org/en/learn/typescript/introduction): TypeScript in Node projects.
- [Prisma Learning Notes](Prisma.md): this repository's Prisma guide.
- [JavaScript Learning Notes](javascript.md): language and runtime foundations.

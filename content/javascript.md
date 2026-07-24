# JavaScript Learning Notes

This is a revision guide from JavaScript basics to advanced concepts. JavaScript is the language; a runtime executes it.

```text
Browser -> DOM, events, fetch, storage
Node.js -> files, servers, npm packages, process
```

Learn sections 1-8 first, build small programs, then study the advanced sections. The interview questions are intentionally last.

## 1. Values and Types

JavaScript has seven primitive types plus objects.

```text
Primitives: undefined, null, boolean, number, bigint, string, symbol
Objects: object, array, function, date, map, set, and more
```

```js
const username = "Utsav";
const age = 24;
const isLearning = true;
const emptyValue = null;
let result;
const largeId = 9007199254740993n;
```

```js
typeof "hello";       // "string"
typeof 42;            // "number"
typeof true;          // "boolean"
typeof undefined;     // "undefined"
typeof {};            // "object"
typeof [];            // "object"
typeof null;          // "object" - historical language mistake
typeof (() => {});    // "function"
```

Use `Array.isArray(value)` for arrays and `value === null` for null.

Use `BigInt` for integer arithmetic beyond safe `number` precision; do not mix it with `number` without explicit conversion. `Symbol` creates a unique property key, mainly for advanced library protocols. Typed arrays such as `Uint8Array` efficiently represent binary numeric data.

### Truthy and Falsy

Falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy, including `[]` and `{}`.

Do not use a truthiness check when `0` or an empty string is a valid value.

```js
if (score !== undefined) {
  console.log(score);
}
```

`undefined` normally means a value was not supplied or assigned. `null` normally means you intentionally say there is no value.

### Strings and Template Literals

Strings are immutable: methods return a new string instead of changing the original.

```js
const name = "  Utsav Singh  ";
const greeting = `Hello, ${name.trim()}!`;

name.trim();                 // "Utsav Singh"
name.includes("Singh");      // true
"a,b,c".split(",");         // ["a", "b", "c"]
"learn javascript".replace("javascript", "JS");
```

Prefer template literals for interpolation and multiline text. Use `includes` when you only need to know whether text is present; use a regular expression when you need a pattern.

## 2. Variables, Scope, and Hoisting

Use `const` by default and `let` only when reassignment is needed. Avoid `var` in modern code.

```js
const city = "Lucknow";
let score = 0;
score += 1;
```

`const` prevents reassignment, not mutation.

```js
const user = { name: "Utsav" };
user.name = "Aman"; // allowed
```

`let` and `const` are block scoped. `var` is function scoped.

```js
if (true) {
  const inside = "block only";
  var oldStyle = "function scoped";
}

// inside is unavailable here
console.log(oldStyle);
```

Hoisting rules:

```js
sayHello(); // works: function declaration is available
function sayHello() {
  console.log("Hello");
}

console.log(value); // undefined
var value = 10;

// console.log(total); // ReferenceError: temporal dead zone
const total = 10;
```

`let` and `const` are hoisted but stay in the temporal dead zone until their declaration line.

## 3. Equality, Conversion, and Operators

Prefer strict equality:

```js
5 === 5;     // true
5 === "5";   // false
5 == "5";    // true because == converts types
```

Use `===` and `!==` by default. An intentional concise check for both `null` and `undefined` is `value == null`.

```js
Number("42");     // 42
String(42);        // "42"
Boolean(0);        // false
Boolean("false"); // true: non-empty string
```

`NaN` is not equal to itself. Use `Number.isNaN(value)` to check for it.

```js
Number.isNaN(NaN); // true
NaN === NaN;      // false
```

### `||` Versus `??`

`||` uses its fallback for every falsy value. `??` uses it only for `null` and `undefined`.

```js
const page = 0;
page || 1; // 1: often wrong
page ?? 1; // 0: correct
```

### Optional Chaining and Logical Assignment

Optional chaining safely stops when the value to its left is `null` or `undefined`; it does not hide other errors.

```js
const city = user?.address?.city; // undefined if address is absent
const title = config.title ?? "Untitled";

config.timeout ??= 5_000; // assign only when nullish
cache[key] ||= createValue(); // assign when the current value is falsy
options.enabled &&= user.canUse; // assign only when the current value is truthy
```

Use `??=` for defaults that must preserve `0`, `false`, and `""`. Avoid optional chaining for data that is required; fail early instead.

## 4. Control Flow and Loops

```js
const label = age >= 18 ? "Adult" : "Minor";

if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
```

Use `switch` for clear fixed cases. Use `for...of` for array values. Use `for...in` for enumerable object keys, not arrays.

```js
for (const todo of todos) {
  console.log(todo.title);
}

for (const key in user) {
  console.log(key);
}
```

`break` ends a loop. `continue` skips the current iteration.

## 5. Functions

Functions are values: you can store, pass, and return them.

```js
function add(first, second) {
  return first + second;
}

const multiply = function (first, second) {
  return first * second;
};

const subtract = (first, second) => first - second;
```

### Defaults, Rest, and Spread

```js
function createUser(name, role = "user") {
  return { name, role };
}

function sum(...numbers) {
  return numbers.reduce((total, number) => total + number, 0);
}

sum(...[1, 2, 3]); // 6
```

Rest gathers remaining values into an array. Spread expands an iterable or object.

### Arrow Functions and `this`

Arrow functions capture `this` from their surrounding scope. Regular functions get `this` from how they are called.

```js
const user = {
  name: "Utsav",
  regular() {
    return this.name;
  },
  arrow: () => this.name,
};

user.regular(); // "Utsav"
user.arrow();   // usually undefined; do not use an arrow for this method
```

Use arrow functions for callbacks. Use method syntax or `function` when dynamic `this` is needed.

## 6. Arrays

Arrays are ordered collections.

```js
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((number) => number * 2);
const even = numbers.filter((number) => number % 2 === 0);
const firstLarge = numbers.find((number) => number > 3);
const hasLarge = numbers.some((number) => number > 3);
const allPositive = numbers.every((number) => number > 0);
const total = numbers.reduce((sum, number) => sum + number, 0);
```

Know mutations:

```text
Mutate: push, pop, shift, unshift, splice, sort, reverse
Do not mutate: map, filter, find, some, every, reduce, slice, concat, toSorted
```

Copy before sorting shared data. `sort()` converts to strings unless you supply a compare function.

```js
const sorted = [...numbers].sort((first, second) => first - second);
```

Useful modern methods:

```js
numbers.includes(3);
numbers.at(-1);              // last item
[1, [2, [3]]].flat(2);      // [1, 2, 3]
[1, 2].flatMap((n) => [n, n * 2]);
```

## 7. Objects and Destructuring

```js
const user = {
  id: 1,
  name: "Utsav",
  city: "Lucknow",
  greet() {
    return "Hello, " + this.name;
  },
};

user.name;
user["city"];
```

Use bracket syntax for a computed property name.

```js
const field = "name";
user[field];
```

```js
const { name, city, age = 0 } = user;
const updatedUser = { ...user, city: "Delhi" };
const { password, ...safeUser } = user;
```

Object and array spread create shallow copies. Nested objects remain shared. Use `structuredClone` for many plain-data deep-copy cases, but not for functions or every special object.

```js
Object.hasOwn(user, "name"); // own property only
"name" in user;              // own or inherited property
```

```js
Object.keys(user);
Object.values(user);
Object.entries(user);
Object.fromEntries([["name", "Utsav"]]);
```

## 8. Errors

Throw errors when a function cannot meet its contract.

```js
function divide(first, second) {
  if (second === 0) {
    throw new Error("Cannot divide by zero");
  }

  return first / second;
}

try {
  divide(10, 0);
} catch (error) {
  console.error(error.message);
} finally {
  console.log("Always runs");
}
```

Use custom error classes when callers need different behavior. Do not use exceptions for normal expected branches.

## 9. Closures

A closure is a function that remembers variables from the scope where it was created.

```js
function createCounter() {
  let count = 0;

  return {
    increment() {
      count += 1;
      return count;
    },
    get() {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.get();       // 1
```

Closures power private state, callbacks, event listeners, memoization, and factories. They can retain memory, so remove unused listeners and timers.

## 10. `this`, `call`, `apply`, and `bind`

For a regular function, `this` comes from the call site.

```js
const user = {
  name: "Utsav",
  greet() {
    return "Hello, " + this.name;
  },
};

const greet = user.greet;
const fixedGreet = user.greet.bind(user);
fixedGreet();
```

```js
function introduce(prefix, suffix) {
  return prefix + " " + this.name + suffix;
}

introduce.call(user, "Hi", "!");
introduce.apply(user, ["Hi", "!"]);
introduce.bind(user, "Hi")("!");
```

`bind` returns a new function. Arrow functions ignore `call`, `apply`, and `bind` for `this` because their `this` is lexical.

## 11. Prototypes and Classes

JavaScript uses a prototype chain. When a property is missing, JavaScript checks the object's prototype.

```js
const animal = {
  speak() {
    return "sound";
  },
};

const dog = Object.create(animal);
dog.name = "Milo";
dog.speak();
```

Classes are syntax over prototypes.

```js
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return "Hello, " + this.name;
  }
}

class Admin extends User {
  constructor(name, permissions) {
    super(name);
    this.permissions = permissions;
  }
}
```

Classes can also have static members and private fields. Private fields are enforced by the language, but they are not a security boundary.

```js
class Counter {
  static created = 0;
  #value = 0;

  increment() {
    this.#value += 1;
    return this.#value;
  }
}
```

Use composition when it is simpler than inheritance.

## 12. Maps, Sets, Iterators, and Generators

Use `Map` for explicit key-value storage and keys of any type. Use `Set` for unique values.

```js
const visits = new Map();
visits.set("Utsav", 3);
visits.get("Utsav");

const tags = new Set(["javascript", "prisma", "javascript"]);
[...tags]; // ["javascript", "prisma"]
```

`WeakMap` and `WeakSet` hold object references weakly and are not iterable. They are useful for object metadata that should not keep an object alive.

`Proxy` can intercept operations such as property reads and writes, and `Reflect` provides matching low-level operations. They are useful for frameworks and metaprogramming, but add indirection; prefer ordinary objects unless interception is truly needed.

Iterables work with `for...of`. Generators create lazy iterators.

```js
function* createIds() {
  let id = 1;
  while (true) {
    yield id;
    id += 1;
  }
}

const ids = createIds();
ids.next().value; // 1
```

## 13. Modules

Modules make dependencies explicit.

```js
// math.js
export function add(first, second) {
  return first + second;
}

// app.js
import { add } from "./math.js";
```

Named exports are usually easier to search and refactor than default exports. ES modules are strict by default. A Node project with `"type": "module"` uses this import/export syntax. Avoid circular imports.

## 14. Promises and `async`/`await`

A promise represents one future result: pending, fulfilled, or rejected.

```js
async function loadTodos() {
  const response = await fetch("/api/todos");

  if (!response.ok) {
    throw new Error("Request failed: " + response.status);
  }

  return response.json();
}
```

An `async` function always returns a promise. `await` pauses that async function, not the whole program.

Start independent work together:

```js
const [user, todos] = await Promise.all([getUser(), getTodos()]);
```

`Promise.all` rejects when one promise rejects. Use `Promise.allSettled` when every outcome matters. Do not use `forEach(async () => {})` when you need to wait for all work; use `for...of` for sequential work or `Promise.all(items.map(...))` for concurrent work.

Promises do not cancel themselves. Use `AbortController` for cancellable browser fetches.

```js
const controller = new AbortController();
const request = fetch("/api/todos", { signal: controller.signal });
controller.abort();

try {
  await request;
} catch (error) {
  if (error.name !== "AbortError") throw error;
}
```

`Promise.race` settles with the first settled input; `Promise.any` fulfills with the first successful input and rejects only when all inputs reject. Use `.finally()` for cleanup that must happen after either outcome.

## 15. The Event Loop

JavaScript runs synchronous code on one call stack. After the stack is empty, it runs microtasks before the next task.

```js
console.log("start");
setTimeout(() => console.log("timer"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("end");
```

Output:

```text
start
end
promise
timer
```

Promise handlers use the microtask queue. Timer callbacks use the task queue. An endless microtask chain can delay timers and rendering.

## 16. DOM, Events, and Browser Safety

```js
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-title");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(input.value);
});
```

Events flow through capture, target, and bubble phases. Event delegation puts one listener on a parent for many children.

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-todo-id]");
  if (!button) return;

  console.log(button.dataset.todoId);
});
```

Use `textContent` for user/API text. Do not put untrusted values into `innerHTML`; that can cause XSS.

### Forms, Fetch, and Browser Storage

Use `FormData` to read a form, validate values before sending them, and show a useful loading, error, or empty state in the UI.

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = new FormData(form).get("title")?.toString().trim();
  if (!title) return;

  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Could not create todo");
});
```

`localStorage` persists across browser restarts; `sessionStorage` lasts for the tab session. Both store strings, are synchronous, and must not hold secrets.

```js
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme") ?? "system";
```

`URL` and `URLSearchParams` are safer than manually concatenating query strings. CORS is a browser rule, not an authorization system; the server must still authenticate and authorize every request.

```js
const url = new URL("/search", location.origin);
url.searchParams.set("q", "javascript");
```

Use `history.pushState` for client-side URL changes and `IntersectionObserver` for efficient visibility work such as lazy-loading. Use a Web Worker for CPU-heavy work that would otherwise block the page; workers cannot directly access the DOM.

## 17. Dates, JSON, Regular Expressions, and Internationalization

```js
const hasOnlyLetters = /^[a-z]+$/i.test("Utsav");
const text = JSON.stringify({ title: "Learn JS" });
const data = JSON.parse(text);
```

JSON does not safely preserve functions, `undefined`, symbols, `BigInt`, maps, sets, dates as Date objects, or circular references. Validate parsed JSON.

Store API/database timestamps in UTC ISO form and format for display at the edge.

```js
new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
}).format(new Date());
```

## 18. Memory and Performance

Objects compare by reference.

```js
{} === {}; // false
const first = { id: 1 };
const second = first;
first === second; // true
```

Common memory leaks: unremoved listeners, endless intervals, unlimited caches, detached DOM nodes, and closures retaining large data.

Garbage collection reclaims values that are no longer reachable; it is nondeterministic, so never use it for required cleanup. `WeakRef` and `FinalizationRegistry` are specialized tools with nondeterministic behavior and are rarely appropriate for application logic.

Debounce waits until calls stop, useful for search input.

```js
function debounce(fn, waitMs) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), waitMs);
  };
}
```

Throttle limits how often a function runs, useful for scroll or resize. Measure before optimizing.

## 19. Node.js Essentials

Node.js supplies runtime APIs that browsers do not, including files, paths, environment variables, and processes. `package.json` records project metadata, dependencies, and runnable scripts.

```js
import { readFile } from "node:fs/promises";
import path from "node:path";

const packageFile = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(await readFile(packageFile, "utf8"));
const port = Number(process.env.PORT ?? 3000);
```

Use ES modules in a project with `"type": "module"`; CommonJS uses `require` and `module.exports`. Do not mix module systems without understanding the interoperability rules. Put secrets in environment variables or a local ignored `.env` file, never in source control or frontend bundles.

## 20. Testing, Debugging, and Clean Code

Test behavior, errors, boundaries, and async failures. Node includes a basic test runner.

```js
import assert from "node:assert/strict";
import test from "node:test";

test("add returns the sum", () => {
  assert.equal(2 + 3, 5);
});
```

Use DevTools breakpoints, Network tab, `console.table`, and `console.trace`. Prefer small named functions, early returns, immutable updates, clear module boundaries, ESLint, and Prettier. Keep tests isolated: mock only external boundaries, test async failures, and add integration tests for code that crosses modules, the network, or the database.

Security reminders:

```text
Never put secrets in frontend code.
Validate untrusted data at the server boundary.
Avoid eval and Function constructor.
Use textContent instead of unsafe innerHTML.
Use parameterized database queries or safe ORM APIs.
```

For browser applications, also protect state-changing cookie-authenticated requests against CSRF, and audit dependencies regularly. CORS does not replace either authorization or CSRF protection.

## 21. JavaScript in Production

Production code needs predictable behavior when input is invalid, dependencies fail, or traffic grows. Keep modules focused, keep configuration outside source code, and make important behavior observable.

### Configuration and Boundaries

Keep secrets and environment-specific values out of source control. Validate configuration once at startup and pass a typed or well-defined configuration object to the rest of the application.

```js
function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const config = {
  databaseUrl: requireEnv("DATABASE_URL"),
  port: Number(process.env.PORT ?? 3000),
};
```

Validate all untrusted input at the boundary: HTTP requests, files, environment values, queues, and third-party APIs. Authentication establishes who made a request; authorization establishes what that identity may do. An ORM and CORS do neither for you.

### Errors, Logging, and Observability

Return safe, useful errors to users and log enough context for developers to investigate. Do not log passwords, tokens, complete payment details, or other sensitive personal data.

```js
try {
  const todo = await createTodo(input);
  logger.info({ todoId: todo.id }, "todo created");
  return todo;
} catch (error) {
  logger.error({ error, requestId }, "create todo failed");
  throw new Error("Unable to create todo right now");
}
```

Use structured logs, request IDs, metrics, traces, error reporting, and health/readiness checks. Alerts should point to a user-impacting condition, not just a noisy internal event.

### Reliability and Performance

Set timeouts for network work. Retry only transient, safe operations, use exponential backoff with a limit, and design state-changing endpoints to be idempotent when clients may retry. Cancel abandoned browser requests with `AbortController` and shut down servers gracefully by stopping new work before closing connections.

Measure before optimizing. Watch response latency, error rate, memory, CPU, database query time, and frontend bundle size. Paginate large lists, cache deliberately with invalidation rules, code-split expensive browser features, and move CPU-heavy browser work to a Web Worker.

### Security and Delivery Checklist

Before release, confirm:

- Inputs are validated and authorization is enforced for every protected action.
- Secrets are managed outside the repository; dependencies and lockfiles are reviewed.
- Requests have sensible size limits, timeouts, rate limits, and security headers where applicable.
- Unit, integration, and end-to-end tests cover critical paths and failure cases.
- CI runs install, lint, type-check where used, tests, and a production build.
- Logs, metrics, error reporting, backups, migrations, rollback, and an owner for the release are ready.

## 22. Useful JavaScript and Node Commands

Run commands from the project folder. Check `package.json` before using a script because script names vary by project.

```sh
node --version              # Read-only: Node version
npm --version               # Read-only: npm version
npm run                     # Read-only: list project scripts
npm run dev                 # Runs the project's development script
npm test                    # Runs the project's test script
npm run lint                # Runs the project's linter, if configured
npm run format              # May write files: runs the formatter, if configured
npm run build               # Creates or updates build output
npm ci                      # Replaces installed dependencies from package-lock.json
npm audit                   # Read-only: reports known dependency vulnerabilities
npm outdated                # Read-only: shows available dependency updates
npm update                  # Changes installed dependency versions within allowed ranges
```

`npm ci` removes and recreates `node_modules`; use it for a clean, lockfile-based install. Review `npm audit fix` before running it because it can change dependency versions. Prefer `npm run <script>` over assuming a tool is installed globally.

```sh
node --test                 # Runs Node's built-in test runner
node --watch src/index.js   # Restarts a Node program when watched files change
node --env-file=.env src/index.js # Loads local environment values; never commit .env secrets
npx tsc --noEmit            # Checks TypeScript without writing JavaScript output
```

## 23. Practice Roadmap

```text
1. Calculator: variables, functions, conditions, errors.
2. In-memory todo list: arrays, objects, CRUD functions.
3. Expense tracker: reduce, grouping, dates, localStorage.
4. Search UI: DOM events, URLSearchParams, debounce, fetch, loading/error states.
5. API client: modules, async/await, AbortController, pagination.
6. Node CLI: package script, filesystem input, environment configuration, tests.
7. Test suite: unit and integration tests for utilities and edge cases.
8. Prisma Todo API: validation, queries, ownership checks, tests.
```

## Resources and Repositories

Use one main tutorial, then use reference material whenever you get stuck.

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide): structured learning from fundamentals to advanced topics.
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference): the best daily reference for syntax, built-ins, and methods.
- [The Modern JavaScript Tutorial](https://javascript.info/): a full modern tutorial from basics to advanced topics.
- [ECMAScript specification](https://tc39.es/ecma262/): exact language rules; use after you know the basics.
- [Node.js Learn](https://nodejs.org/en/learn): JavaScript in the Node runtime.
- [javascript-tutorial/en.javascript.info](https://github.com/javascript-tutorial/en.javascript.info): source and exercises for javascript.info.
- [getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS): deeper study of scope, closures, objects, and async behavior.
- [30-seconds/30-seconds-of-code](https://github.com/30-seconds/30-seconds-of-code): short examples after you understand fundamentals.
- [eslint/eslint](https://github.com/eslint/eslint): learn modern linting and explore a mature JavaScript codebase.

## JavaScript Interview Questions and Answers

### 1. What is the difference between `var`, `let`, and `const`?

`var` is function-scoped, can be redeclared, and is initialized as `undefined` when hoisted. `let` and `const` are block-scoped and stay in the temporal dead zone until declared. `const` cannot be reassigned; `let` can.

### 2. What is the difference between `==` and `===`?

`==` coerces types before comparison. `===` compares type and value without coercion. Use `===` by default because it is predictable.

### 3. What is a closure?

A closure is a function with access to variables from the scope where it was created. It is used for private state, callbacks, event handlers, and factories.

### 4. What is hoisting?

JavaScript processes declarations before executing a scope. Function declarations are callable before their line, `var` reads as `undefined`, and `let`/`const` cannot be used before declaration because of the temporal dead zone.

### 5. What is the difference between an arrow function and a regular function?

The important difference is `this`. A regular function gets `this` from its call site. An arrow function captures lexical `this` from its surrounding scope. Arrow functions cannot be constructors.

### 6. What are `map`, `filter`, and `reduce` for?

`map` transforms every item, `filter` keeps matching items, and `reduce` combines items into one result such as a sum or object.

### 7. What is the difference between `for...in` and `for...of`?

`for...in` iterates enumerable property keys, mainly for objects. `for...of` iterates values from iterables such as arrays, strings, maps, and sets.

### 8. What is a shallow copy?

A shallow copy duplicates only the outer object or array. Nested object references are still shared. Spread syntax is shallow.

### 9. What is a prototype?

A prototype is the object JavaScript checks when a property is missing on the current object. The prototype chain is JavaScript's inheritance model; classes use it underneath.

### 10. What is a promise?

A promise represents one future result. It is pending, then settles once as fulfilled or rejected. Consume it with `then`/`catch` or `async`/`await`.

### 11. What does `async`/`await` do?

An `async` function returns a promise. `await` pauses only that async function until a promise settles, then returns its value or throws its rejection.

### 12. Explain the event loop.

Synchronous code runs first. Once the call stack is empty, JavaScript drains microtasks such as promise handlers before running the next task, such as a timer callback.

### 13. What is the difference between `Promise.all` and `Promise.allSettled`?

`Promise.all` rejects when any input rejects. `Promise.allSettled` waits for all inputs and returns every fulfilled/rejected outcome.

### 14. Why is `forEach(async () => {})` a problem?

`forEach` does not wait for callback promises. Use `for...of` with `await` for sequential work or `await Promise.all(items.map(...))` for concurrent work.

### 15. What is event delegation?

It uses event bubbling: one parent listener handles matching child elements. It reduces listeners and works for children added later.

### 16. What is the difference between `||` and `??`?

`||` falls back for any falsy value. `??` falls back only for `null` and `undefined`, so it preserves valid values such as `0` and `""`.

### 17. What is optional chaining?

`object?.property` returns `undefined` instead of throwing when `object` is nullish. It is useful for truly optional values, not for hiding required-data bugs.

### 18. Why is `NaN !== NaN`?

`NaN` represents an invalid numeric result and is intentionally unequal to every value, including itself. Test it with `Number.isNaN`.

### 19. What is the difference between `Map` and an object?

Objects are good records with named fields. `Map` is explicit key-value storage, accepts keys of any type, has a `size`, and provides `set`, `get`, and `has`.

### 20. What causes JavaScript memory leaks?

Memory leaks happen when unused data remains reachable. Typical causes are listeners, timers, caches without limits, detached DOM nodes, and closures retaining large objects.

### 21. What is debouncing?

Debouncing waits until calls have stopped for a delay. It is commonly used for search input to avoid one request per keystroke.

### 22. What is an ES module?

An ES module uses `import` and `export` to declare dependencies. It has its own scope and runs in strict mode.

### 23. What does `bind` do?

`bind` returns a new regular function with `this` fixed to a chosen value and can prefill arguments. It is useful when passing methods as callbacks.

### 24. What is XSS and how do you reduce it?

Cross-site scripting happens when untrusted content becomes executable page code. Prefer `textContent`, avoid unsafe `innerHTML`, validate input, and use a Content Security Policy.

### 25. How do you make JavaScript code maintainable?

Use clear module boundaries, small functions, validation, deliberate error handling, tests, a formatter and linter, readable names, and performance measurements before optimization.

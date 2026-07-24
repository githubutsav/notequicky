# React Learning Notes

React is a JavaScript library for building user interfaces from components. A component receives inputs, keeps only the state it truly needs, and returns UI for the current state.

```text
State + props -> component render -> React updates the DOM
```

React code should feel like describing the screen for a state, not manually giving the browser step-by-step DOM instructions. Learn sections 1-10 first, then come back for architecture, performance, testing, and React 19 features.

These notes assume modern React 19.x docs, function components, Hooks, TypeScript, and a normal build tool such as Vite or a framework such as Next.js.

## 1. Setup and Mental Model

For learning React as a frontend library, Vite is a simple starting point.

```sh
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
```

A minimal React browser entry looks like this:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

React itself defines components and Hooks. `react-dom` renders React components into the browser DOM. The DOM is still real, but React decides the smallest useful updates after your component state changes.

```text
react       -> components, JSX behavior, Hooks
react-dom   -> browser rendering
Vite        -> local dev server, bundling, JSX transform
TypeScript  -> type checking
```

Use a framework when the app needs routing, server rendering, data loading conventions, authentication flows, deployment conventions, or backend integration. Use Vite when you mainly want a client-side app or a focused learning project.

## 2. Components and JSX

A component is usually a function whose name starts with a capital letter. It returns JSX, which is JavaScript syntax for describing UI.

```tsx
function WelcomeMessage() {
  return <h1>Welcome back</h1>;
}

export default function App() {
  return (
    <main>
      <WelcomeMessage />
      <p>React renders components into the page.</p>
    </main>
  );
}
```

JSX rules:

```text
Return one parent element, or use <>...</>.
Use className instead of class.
Use htmlFor instead of for on labels.
Use camelCase for most DOM props: onClick, tabIndex, aria-label stays kebab-case.
Put JavaScript expressions inside { }.
Close every tag, including <img /> and <input />.
```

```tsx
const username = "Utsav";
const isLoggedIn = true;

function Header() {
  return (
    <header className="site-header">
      <h1>{isLoggedIn ? `Hello, ${username}` : "Please sign in"}</h1>
    </header>
  );
}
```

JSX is not a string template. React escapes text values before rendering them, which helps prevent accidental HTML injection. Avoid `dangerouslySetInnerHTML` unless the HTML is trusted and sanitized.

## 3. Props and Children

Props are inputs passed from a parent component to a child component. Treat props as read-only.

```tsx
type UserCardProps = {
  name: string;
  role: string;
  isOnline?: boolean;
};

function UserCard({ name, role, isOnline = false }: UserCardProps) {
  return (
    <article className="user-card">
      <h2>{name}</h2>
      <p>{role}</p>
      <span>{isOnline ? "Online" : "Offline"}</span>
    </article>
  );
}

function TeamList() {
  return (
    <section>
      <UserCard name="Utsav" role="Frontend Engineer" isOnline />
      <UserCard name="Aman" role="Backend Engineer" />
    </section>
  );
}
```

Use `children` when a component should wrap unknown content.

```tsx
import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

Props are like function arguments. State is like a component's memory. If data comes from the parent, it is probably a prop. If the component needs to remember something that changes over time, it may be state.

## 4. Lists and Conditional Rendering

Use normal JavaScript for conditions.

```tsx
function EmptyState() {
  return <p>No todos yet.</p>;
}

function TodoSummary({ count }: { count: number }) {
  if (count === 0) return <EmptyState />;
  return <p>You have {count} todos.</p>;
}
```

Use `map` to render lists. Give each item a stable `key` so React can match rendered items across updates.

```tsx
type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span>{todo.title}</span>
          {todo.completed && <strong> Done</strong>}
        </li>
      ))}
    </ul>
  );
}
```

Avoid using array indexes as keys when items can be inserted, removed, sorted, or filtered. Index keys can make state appear to move to the wrong item.

## 5. State and Events

Use `useState` when a component needs to remember information between renders.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  return (
    <button type="button" onClick={increment}>
      Count: {count}
    </button>
  );
}
```

State behaves like a snapshot for the current render. Calling the setter requests a new render; it does not change the current variable immediately.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function incrementThreeTimes() {
    setCount((current) => current + 1);
    setCount((current) => current + 1);
    setCount((current) => current + 1);
  }

  return <button onClick={incrementThreeTimes}>{count}</button>;
}
```

Use the functional updater form when the next state depends on the previous state.

React event handlers receive React event objects. Name handlers after the event or user intent.

```tsx
function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <label>
      Search
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </label>
  );
}
```

## 6. Forms and Controlled Inputs

A controlled input gets its value from React state and updates that state on change.

```tsx
import { useState } from "react";

function TodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAdd(trimmedTitle);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="todo-title">Todo title</label>
      <input
        id="todo-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}
```

Use controlled inputs when React needs to validate, transform, reset, or respond to the value immediately. Uncontrolled inputs can be fine for simple forms where the value is only read on submit.

```tsx
function LoginForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    console.log({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" required />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}
```

## 7. Choosing and Updating State

Keep state minimal. If a value can be computed from props or existing state, do not store it separately.

```tsx
function ProductTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const visibleProducts = products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesStock = !inStockOnly || product.inStock;
    return matchesQuery && matchesStock;
  });

  return <ProductList products={visibleProducts} />;
}
```

Do not duplicate derived values:

```tsx
// Avoid this.
const [todos, setTodos] = useState<Todo[]>([]);
const [todoCount, setTodoCount] = useState(0);

// Prefer this.
const todoCount = todos.length;
```

Update objects and arrays immutably. Create new values instead of mutating existing state.

```tsx
type Profile = {
  name: string;
  city: string;
};

function ProfileEditor() {
  const [profile, setProfile] = useState<Profile>({
    name: "Utsav",
    city: "Lucknow",
  });

  function updateCity(city: string) {
    setProfile((current) => ({
      ...current,
      city,
    }));
  }

  return (
    <input
      value={profile.city}
      onChange={(event) => updateCity(event.target.value)}
    />
  );
}
```

Array update patterns:

```tsx
setTodos((todos) => [...todos, newTodo]);
setTodos((todos) => todos.filter((todo) => todo.id !== idToDelete));
setTodos((todos) =>
  todos.map((todo) =>
    todo.id === idToToggle
      ? { ...todo, completed: !todo.completed }
      : todo,
  ),
);
```

## 8. Effects and External Systems

`useEffect` is for synchronizing with systems outside React: network requests, timers, subscriptions, browser APIs, analytics, and third-party widgets.

```tsx
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load user");
        }

        const data = (await response.json()) as User;
        setUser(data);
        setError(null);
      } catch (unknownError) {
        if (controller.signal.aborted) return;
        setError(unknownError instanceof Error ? unknownError.message : "Unknown error");
      }
    }

    loadUser();

    return () => {
      controller.abort();
    };
  }, [userId]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
```

Important effect rules:

```text
Put every reactive value used by the effect in the dependency array.
Return a cleanup function for subscriptions, timers, sockets, and abortable requests.
Do not use effects to calculate values that can be derived while rendering.
If an effect keeps looping, check changing object/function dependencies.
In Strict Mode, effects may run an extra setup+cleanup cycle in development.
```

You probably do not need an effect when you are only deriving data for rendering.

```tsx
// Avoid this.
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// Prefer this.
const fullName = `${firstName} ${lastName}`;
```

## 9. Refs

Use `useRef` when you need to remember a value without causing a render, or when you need access to a DOM element.

```tsx
import { useRef } from "react";

function FocusInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input ref={inputRef} />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus
      </button>
    </>
  );
}
```

Refs are useful for focus, measuring elements, storing timer IDs, and integrating with imperative browser APIs. Do not use refs as a secret replacement for state. If a value affects what appears on the screen, use state.

## 10. Hooks Rules and Custom Hooks

Hooks are functions that start with `use`. They let components use React features such as state, effects, refs, reducer state, context, and transitions.

Rules of Hooks:

```text
Only call Hooks at the top level of a component or custom Hook.
Only call Hooks from React function components or custom Hooks.
Do not call Hooks inside loops, conditions, nested functions, event handlers, or try/catch blocks.
```

Custom Hooks extract reusable stateful logic. They do not share state by themselves; each call gets its own state.

```tsx
import { useEffect, useState } from "react";

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function LayoutLabel() {
  const width = useWindowWidth();
  return <p>{width >= 768 ? "Desktop" : "Mobile"}</p>;
}
```

Use custom Hooks when you want to reuse behavior, not when you only want to reuse markup. Reusable markup usually belongs in a component.

## 11. Context

Context passes values through the component tree without manually passing props at every level.

```tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
```

Context is good for app-wide or subtree-wide values such as theme, locale, authenticated user, feature flags, and dependency-like services. Do not put every piece of app state into context. Large, frequently changing context values can cause many components to re-render.

For choosing between Context, TanStack Query, Zustand, Redux Toolkit, Jotai, and Recoil maintenance, see [state-management.md](state-management.md).

## 12. Reducers

Use `useReducer` when state transitions are complex, when several events update the same state shape, or when you want a clear list of allowed actions.

```tsx
import { useReducer } from "react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

type TodoAction =
  | { type: "added"; title: string }
  | { type: "toggled"; id: string }
  | { type: "deleted"; id: string };

function todoReducer(todos: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "added":
      return [
        ...todos,
        {
          id: crypto.randomUUID(),
          title: action.title,
          completed: false,
        },
      ];
    case "toggled":
      return todos.map((todo) =>
        todo.id === action.id
          ? { ...todo, completed: !todo.completed }
          : todo,
      );
    case "deleted":
      return todos.filter((todo) => todo.id !== action.id);
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <>
      <button onClick={() => dispatch({ type: "added", title: "Learn React" })}>
        Add
      </button>
      <TodoList todos={todos} />
    </>
  );
}
```

Reducers should be pure. Given the same state and action, a reducer should return the same next state and should not perform side effects.

## 13. Component Design

Good React component design starts with data flow.

```text
Break UI into components.
Identify which data is fixed and which data changes.
Keep changing data in the closest common parent that needs to own it.
Pass data down with props.
Pass events up with callback props.
Compute derived values during render.
```

Example:

```tsx
type FilterControlsProps = {
  query: string;
  inStockOnly: boolean;
  onQueryChange: (query: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
};

function FilterControls({
  query,
  inStockOnly,
  onQueryChange,
  onInStockOnlyChange,
}: FilterControlsProps) {
  return (
    <form>
      <label>
        Search
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => onInStockOnlyChange(event.target.checked)}
        />
        Only show products in stock
      </label>
    </form>
  );
}
```

Prefer composition over boolean-heavy components.

```tsx
// Harder to scale.
<Button primary danger loading fullWidth />

// Often clearer.
<Button variant="danger" isLoading>
  Delete account
</Button>
```

Keep components small enough that their data flow is easy to read. Do not split every element into its own component just to make files look tidy.

## 14. TypeScript with React

Use TypeScript to type props, state, events, refs, and API data.

```tsx
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
};

function Button({ variant = "primary", children, onClick }: ButtonProps) {
  return (
    <button className={`button button-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

Common event types:

```tsx
function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value);
}

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.name);
}
```

Common patterns:

```tsx
const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement | null>(null);

type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");
```

Avoid `React.FC` by default. It is not wrong, but plain function declarations usually make props and return behavior clearer.

```tsx
type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}</p>;
}
```

Validate data that crosses runtime boundaries. TypeScript cannot prove that an API response really matches your type.

## 15. Styling

React does not require one styling method. Common options:

```text
Plain CSS files          Simple, good for small apps and global styles.
CSS Modules             Scoped class names without a CSS-in-JS runtime.
Tailwind CSS            Utility classes and fast UI iteration.
CSS-in-JS               Component-oriented styling, often with runtime tradeoffs.
Design-system library   Useful when consistency and speed matter more than custom UI.
```

For a broader frontend design and UI library guide, see [frontend-design.md](frontend-design.md). For dedicated utility-first styling and component workflow notes, see [tailwind.md](tailwind.md) and [shadcn.md](shadcn.md).

Plain CSS example:

```tsx
function Alert({ children }: { children: React.ReactNode }) {
  return <div className="alert">{children}</div>;
}
```

```css
.alert {
  border: 1px solid #f59e0b;
  background: #fffbeb;
  color: #92400e;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}
```

Use semantic HTML first. A styled `<button>` is better than a clickable `<div>`. A real `<label>` improves accessibility and click behavior without extra JavaScript.

## 16. Performance

Most React performance problems come from doing too much work on every render, re-rendering too much of the tree, or fetching data inefficiently.

Start simple. Reach for performance tools when there is a measured problem.

```text
Use stable keys for lists.
Keep state close to where it is needed.
Avoid duplicating state.
Memoize expensive calculations with useMemo.
Memoize callback identity with useCallback only when it helps a memoized child or Hook dependency.
Use React.memo for pure components that re-render often with the same props.
Virtualize very large lists.
Debounce high-frequency input before expensive work.
```

```tsx
import { useMemo, useState } from "react";

function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  }, [products, query]);

  return <ProductList products={visibleProducts} />;
}
```

Do not wrap everything in `useMemo`, `useCallback`, or `React.memo`. Memoization has its own complexity and can make code harder to reason about.

## 17. Routing and Data Loading

React does not include routing by itself. Use a router or framework for pages, URLs, nested layouts, and navigation.

Common choices:

```text
React Router      Client-side routing and data APIs for React apps.
Next.js           React framework with server rendering, routing, and backend features.
Remix             Full-stack React framework focused on web fundamentals.
TanStack Router   Type-safe routing with strong search param support.
```

For small learning projects, client-side routing is enough. For production apps, choose routing and data loading together. Fetching data directly in every component with effects can become messy once loading states, errors, caching, refetching, mutations, and server rendering matter.

Data fetching options:

```text
Framework loaders/server components   Best when using a framework.
TanStack Query / SWR                   Client-side caching and server-state management.
useEffect + fetch                      Fine for small demos or one-off external sync.
```

## 18. React 19 Notes

React 19 made several modern patterns first-class.

```text
Actions can handle async transitions and form submissions.
useActionState helps manage form/action state.
useOptimistic helps show temporary optimistic UI.
The use API can read resources in supported rendering environments.
ref can be passed as a prop in newer React patterns.
The modern JSX transform is required.
```

Use these features when your project setup and framework support them. For beginner learning, master components, props, state, effects, forms, and data flow before going deep on React 19's advanced APIs.

Example shape of `useActionState`:

```tsx
import { useActionState } from "react";

type FormState = {
  message: string;
};

async function saveName(
  previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { message: "Name is required" };
  }

  await fetch("/api/profile", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  return { message: "Saved" };
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(saveName, {
    message: "",
  });

  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit" disabled={isPending}>
        Save
      </button>
      <p>{state.message}</p>
    </form>
  );
}
```

## 19. Testing

Test user-visible behavior more than implementation details.

Common stack:

```text
Vitest or Jest                  Test runner.
React Testing Library           Render components and query like a user.
Playwright                      Browser-level end-to-end tests.
Mock Service Worker             Mock network requests during tests/development.
```

Example with React Testing Library:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import Counter from "./Counter";

test("increments the count", async () => {
  const user = userEvent.setup();

  render(<Counter />);

  await user.click(screen.getByRole("button", { name: /count: 0/i }));

  expect(screen.getByRole("button", { name: /count: 1/i })).toBeInTheDocument();
});
```

Prefer accessible queries such as `getByRole`, `getByLabelText`, and `getByText`. If a test cannot find an element like a user would, the UI may also be harder to use.

For a deeper frontend testing guide covering Vitest, Testing Library, MSW, Playwright, Storybook, accessibility checks, and visual regression, see [frontend-testing.md](frontend-testing.md).

## 20. Common Mistakes

### Mutating state directly

```tsx
// Avoid this.
todo.completed = true;
setTodo(todo);

// Prefer this.
setTodo((current) => ({ ...current, completed: true }));
```

### Storing derived state

```tsx
// Avoid this.
const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);

// Prefer this.
const filteredTodos = todos.filter((todo) => todo.title.includes(query));
```

### Missing effect dependencies

```tsx
// Avoid this if userId is used inside the effect.
useEffect(() => {
  loadUser(userId);
}, []);

// Prefer this.
useEffect(() => {
  loadUser(userId);
}, [userId]);
```

### Calling Hooks conditionally

```tsx
// Avoid this.
if (isLoggedIn) {
  const [profile, setProfile] = useState(null);
}

// Prefer this.
const [profile, setProfile] = useState(null);
if (!isLoggedIn) return <LoginPrompt />;
```

### Using effects for event logic

```tsx
// Avoid this.
useEffect(() => {
  if (shouldSubmit) {
    submitForm();
  }
}, [shouldSubmit]);

// Prefer this.
function handleSubmit() {
  submitForm();
}
```

## 21. Practice Path

Build these in order:

```text
Counter                    useState, events.
Todo list                  arrays, forms, keys, derived state.
Searchable product table   component breakdown, lifted state.
Weather card               effects, fetch, loading and error states.
Theme switcher             context.
Shopping cart              reducers, derived totals.
Notes app                  routing, persistence, forms, filtering.
Dashboard                  charts, tables, loading states, error boundaries.
```

For reusable frontend screen and component recipes, see [ui-patterns.md](ui-patterns.md).

For each project, ask:

```text
What data is fixed?
What data changes?
Which component owns that changing data?
Can this value be computed instead of stored?
What should happen while data is loading?
What should happen when something fails?
How will keyboard and screen-reader users operate this?
```

## 22. Repositories to Learn From

Do not copy a large repo's architecture blindly. Read it like a map: pick one user flow, trace it from route to component to API/data layer, then write down the pattern in your own words.

Good repos to study:

```text
bulletproof-react
  https://github.com/alan2207/bulletproof-react
  Study this first for production React structure: feature folders, API layer,
  state, testing, error handling, security, performance, and deployment.

shadcn/ui
  https://github.com/shadcn-ui/ui
  Study component design, accessible primitives, Tailwind styling, design-system
  documentation, and the copy-the-code ownership model.

Dub
  https://github.com/dubinc/dub
  Study a real Next.js SaaS app: routing, auth, Prisma, Tailwind, analytics,
  middleware, billing, monorepo structure, and production integrations.

Cal.com / Cal.diy
  https://github.com/calcom/cal.com
  Study scheduling workflows, complex product state, integrations, Prisma,
  tRPC, Zod, Tailwind, and a large Next.js codebase.

Formbricks
  https://github.com/formbricks/formbricks
  Study forms, survey builders, validation, in-app widgets, Auth.js, Prisma,
  Zod, Vitest, and full-stack product architecture.

Vercel Commerce
  https://github.com/vercel/commerce
  Study App Router, React Server Components, Server Actions, Suspense,
  useOptimistic, ecommerce pages, and server-rendered performance.

Documenso
  https://github.com/documenso/documenso
  Study document workflows, PDF-heavy UI, signatures, payments, Prisma,
  Tailwind, shadcn/ui, tRPC, and production self-hosting concerns.
```

How to read a repo:

```text
1. Read README.md, package.json scripts, and .env.example first.
2. Find the app entry: app routes, pages, router config, or main.tsx.
3. Trace one flow, such as login, create item, edit item, delete item.
4. Identify the component boundary, API/data boundary, validation, and errors.
5. Look for tests around that flow.
6. Compare the pattern with these notes before using it in your own app.
```

Use mature repos to learn tradeoffs, not to collect dependencies. A small app does not need every library used by a large SaaS product.

## 23. Suspense, Lazy Loading, Error Boundaries, Portals, and Transitions

Use these tools when the app starts feeling like a real product: multiple routes, expensive UI, overlays, slow data, and failures that need recovery.

### `lazy` and `Suspense`

`lazy` loads component code only when it is needed. `Suspense` shows a fallback while Suspense-enabled work is loading.

```tsx
import { Suspense, lazy } from "react";

const SettingsPage = lazy(() => import("./SettingsPage"));

export default function App() {
  return (
    <Suspense fallback={<p>Loading settings...</p>}>
      <SettingsPage />
    </Suspense>
  );
}
```

Use code splitting for large routes, heavy dashboards, editors, charts, and rarely used admin screens. Do not split every tiny component; too many small chunks can make loading worse.

Important Suspense notes:

```text
Suspense works for lazy-loaded component code.
Suspense works with frameworks/libraries that support Suspense data loading.
Suspense does not automatically track fetch calls made inside useEffect.
Keep fallbacks lightweight: skeleton, spinner, or reserved layout area.
Place boundaries around meaningful UI regions, not randomly around every component.
```

### Error Boundaries

Error boundaries catch rendering errors below them and show fallback UI. They do not catch errors in event handlers, async callbacks, or server code.

React still uses class components for custom error boundaries:

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI crashed", { error, componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Use boundaries around routes, dashboards, third-party widgets, and risky feature areas. Pair them with logging, a retry/reset path, and a fallback that does not hide the rest of the app.

### Portals

Portals render UI somewhere else in the DOM while keeping React event behavior connected to the component tree. They are useful for modals, dialogs, dropdowns, tooltips, and toasts.

```tsx
import { createPortal } from "react-dom";

function Modal({ children }: { children: React.ReactNode }) {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="modal">
      {children}
    </div>,
    modalRoot,
  );
}
```

Portal UI still needs focus management, escape-key handling, scroll locking, and accessible labels. Prefer a tested dialog primitive when accessibility requirements get serious.

### `useTransition`

`useTransition` marks state updates as non-urgent so typing, clicking, and other urgent updates stay responsive.

```tsx
import { useState, useTransition } from "react";

function SearchTabs() {
  const [tab, setTab] = useState("all");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <>
      <button onClick={() => selectTab("all")}>All</button>
      <button onClick={() => selectTab("archived")}>Archived</button>
      {isPending && <span>Updating...</span>}
      <Results tab={tab} />
    </>
  );
}
```

Do not use transitions to control text inputs. Keep the input state urgent, then make the expensive result update non-urgent.

### `useDeferredValue`

`useDeferredValue` lets a value lag behind while urgent UI updates continue immediately.

```tsx
import { useDeferredValue, useMemo, useState } from "react";

function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const visibleProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(deferredQuery.toLowerCase()),
    );
  }, [products, deferredQuery]);

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      {query !== deferredQuery && <p>Updating results...</p>}
      <ProductList products={visibleProducts} />
    </>
  );
}
```

Use it for expensive search results, large filtered lists, charts, and preview panes. It improves responsiveness; it does not replace debouncing network requests.

## 24. Production React Architecture

Small learning apps can keep files simple. Production apps need clear boundaries so features do not leak into each other.

One practical structure:

```text
src/
  app/                 app shell, providers, routes, layout
  features/
    auth/
      api/             auth-specific requests
      components/      auth-specific UI
      hooks/           auth-specific logic
      schemas/         Zod or runtime validation
      types.ts
    projects/
      api/
      components/
      hooks/
      schemas/
      types.ts
  shared/
    components/        reusable UI with no feature knowledge
    lib/               small framework-agnostic helpers
    config/            validated runtime config
    test/              test utilities
```

Rules that keep the app calm:

```text
Feature code can import shared code.
Shared code should not import feature code.
API functions should normalize server responses and errors.
Route components should compose features, not contain every detail.
Validation belongs at runtime boundaries: forms, API responses, env config.
Auth state answers "who is the user"; authorization still checks "can they do this".
```

Configuration should be validated once at startup or app boot:

```ts
import { z } from "zod";

const publicConfigSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});

export const publicConfig = publicConfigSchema.parse(import.meta.env);
```

Client-side environment variables are public after bundling. Never put database URLs, JWT signing secrets, private API keys, or service credentials into frontend config.

Production checklist:

```text
npm run lint passes.
npm test passes.
npm run build passes.
Runtime config is validated.
Errors are logged without secrets or passwords.
Bundle size and large dependencies are reviewed.
Critical flows have loading, empty, error, and success states.
Forms validate on client and server.
Protected actions are authorized on the server.
Keyboard navigation and labels are tested.
```

## 25. Data Fetching and Server State

Server state is different from client state. Server state is owned outside the browser, can become stale, needs loading and error states, and often benefits from caching.

For small demos, `useEffect + fetch` is fine. For real apps, use framework loaders/server components or a server-state library.

For the difference between server state and client state, see [state-management.md](state-management.md).

Common choices:

```text
Framework loaders/server components   Best for SSR, routing, and server-owned data.
TanStack Query                        Best for client-side cache, mutations, invalidation.
SWR                                   Lightweight client-side cache and refetching.
useEffect + fetch                     Fine for small one-off external synchronization.
```

TanStack Query shape:

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function Todos() {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  const addTodoMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  if (todosQuery.isPending) return <p>Loading...</p>;
  if (todosQuery.isError) return <p>Could not load todos.</p>;

  return (
    <>
      <button
        type="button"
        disabled={addTodoMutation.isPending}
        onClick={() => addTodoMutation.mutate({ title: "Learn React" })}
      >
        Add todo
      </button>
      <ul>
        {todosQuery.data.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  );
}
```

Good server-state habits:

```text
Use stable query keys: ["projects", projectId].
Validate or normalize API responses at the boundary.
Cancel requests when the library/framework supports it.
Invalidate queries after mutations that change server data.
Avoid blind retries for unsafe writes.
Keep optimistic updates small and reversible.
Show stale data with a subtle pending state when it improves UX.
```

## 26. Forms With React Hook Form and Zod

Controlled inputs are great for learning and small forms. For larger forms with many fields, validation modes, field arrays, and performance concerns, use a form library.

React Hook Form with Zod:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Use a valid email"),
  age: z.number().int().min(13, "You must be at least 13"),
});

type ProfileInput = z.infer<typeof profileSchema>;

function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 18,
    },
  });

  async function onSubmit(values: ProfileInput) {
    await saveProfile(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Name</label>
      <input id="name" {...register("name")} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register("email")} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="age">Age</label>
      <input id="age" type="number" {...register("age", { valueAsNumber: true })} />
      {errors.age && <p role="alert">{errors.age.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

Form rules:

```text
Client validation improves UX; server validation protects the system.
Use labels and useful error text.
Use aria-invalid and role="alert" carefully for errors.
Do not trust hidden inputs or disabled fields.
Reset forms deliberately after successful submit.
Keep server errors separate from field validation errors.
```

## 27. Accessibility, Security, Profiling, and React Compiler

### Accessibility

Start with real HTML:

```text
Use button for actions.
Use a for navigation.
Use label with inputs.
Use fieldset and legend for grouped form controls.
Use headings in order.
Use ARIA only when native HTML is not enough.
```

Checklist:

```text
Every interactive element is reachable by keyboard.
Focus is visible.
Modals trap focus and return focus when closed.
Error messages are connected to fields.
Images have useful alt text or empty alt="" when decorative.
Color is not the only way to show state.
Loading and error states do not move focus unexpectedly.
```

### Security

Frontend security is mostly about not turning untrusted data into executable code and not pretending client checks are authorization.

```text
Avoid dangerouslySetInnerHTML unless content is trusted and sanitized.
Never store signing secrets or database credentials in frontend code.
Treat localStorage as readable by JavaScript; avoid storing high-value tokens there.
Use httpOnly, secure, sameSite cookies when the backend owns sessions.
Defend cookie-backed mutations against CSRF.
Keep dependency updates reviewed instead of blindly applying fixes.
Do authorization on the server for every protected action.
Do not log passwords, tokens, or personal data.
```

### Profiling

Optimize after measuring:

```text
Use React DevTools Profiler to find slow renders.
Use browser Performance tools for main-thread work and network waterfalls.
Check bundle output for unexpectedly large dependencies.
Virtualize huge lists.
Split large route bundles.
Move expensive derived work behind useMemo only when it is measured.
Prefer React Compiler for broad render optimization when the project supports it.
```

### React Compiler

React Compiler is a build-time optimizer that can automatically memoize React code when the code follows React's rules. It is stable in the current React docs, optional today, and best adopted gradually in existing apps.

Basic install:

```sh
npm install -D babel-plugin-react-compiler@latest
```

For React 19 projects, default compiler output targets React 19. React 17 and 18 projects need the compiler runtime and a matching `target` option.

```text
Do not add the compiler to hide impure render code.
Fix Rules of React violations first.
Keep existing manual memoization until profiling and tests prove it is safe to remove.
Use compiler directives such as "use memo" or "use no memo" only for targeted rollout or debugging.
Run tests and profile important flows before and after enabling it.
```

## 28. Repository Study Exercises

Use these exercises when reading the repos from section 22.

```text
Dub
  Trace link creation:
  route/page -> form -> validation -> API/server action -> Prisma/database
  -> analytics/cache/update -> success/error UI.

Cal.com
  Trace booking creation:
  route -> availability UI -> timezone handling -> mutation -> calendar integration
  -> confirmation/error state.

Formbricks
  Trace survey creation:
  editor UI -> field validation -> persistence -> preview/embed behavior
  -> test coverage.

Vercel Commerce
  Trace add-to-cart:
  product route -> server-rendered data -> mutation/server action -> optimistic UI
  -> cart display.

shadcn/ui
  Trace one component:
  primitive -> styling variants -> accessibility behavior -> generated code
  -> example docs.
```

For each repo, write down:

```text
What problem does this structure solve?
Which parts are useful for a small app?
Which parts only exist because the product is large?
Where are runtime validation, authorization, and error handling done?
What would you avoid copying?
```

## Quick Reference

```tsx
import {
  Suspense,
  createContext,
  lazy,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
```

```text
useState      Local component memory.
useEffect     Synchronize with an external system.
useRef        Store a mutable value or DOM reference without rendering.
useMemo       Memoize an expensive derived value.
useCallback   Memoize a function identity when it matters.
useReducer    Manage complex state transitions.
useContext    Read context from a provider above.
Suspense      Show fallback UI for Suspense-enabled loading.
lazy          Load component code only when needed.
useTransition Mark non-urgent updates so urgent UI stays responsive.
useDeferredValue Let expensive UI lag behind urgent input.
```

```text
Props down, events up.
State should be minimal and owned by the closest useful parent.
Components and Hooks should be pure during render.
Effects are for external systems.
Keys should be stable IDs.
Never mutate state directly.
Prefer semantic HTML and accessible forms.
Use TypeScript at component boundaries and API boundaries.
```

## References

- React docs: https://react.dev/
- React versions: https://react.dev/versions
- Thinking in React: https://react.dev/learn/thinking-in-react
- Built-in Hooks: https://react.dev/reference/react/hooks
- Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks
- `useState`: https://react.dev/reference/react/useState
- `useEffect`: https://react.dev/reference/react/useEffect
- `Suspense`: https://react.dev/reference/react/Suspense
- `lazy`: https://react.dev/reference/react/lazy
- `useTransition`: https://react.dev/reference/react/useTransition
- `useDeferredValue`: https://react.dev/reference/react/useDeferredValue
- React Compiler: https://react.dev/learn/react-compiler
- React 19 release notes: https://react.dev/blog/2024/12/05/react-19
- React 19.2 release notes: https://react.dev/blog/2025/10/01/react-19-2
- TanStack Query React docs: https://tanstack.com/query/latest/docs/framework/react/overview
- React Hook Form docs: https://react-hook-form.com/
- React Hook Form resolvers: https://github.com/react-hook-form/resolvers

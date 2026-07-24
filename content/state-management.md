# React State Management Learning Notes

State management means deciding where a piece of data should live, who can change it, and how the UI stays consistent after it changes.

```text
Local UI state       -> React useState/useReducer
Shared UI state      -> props, Context, Zustand, Jotai, Redux Toolkit
Server/API state     -> Server Components, Server Functions, TanStack Query, SWR
URL state            -> route params and search params
Form state           -> local state, uncontrolled forms, React Hook Form
Persistent state     -> server database first, localStorage only for low-risk UI prefs
```

Most state bugs come from putting state in the wrong place, duplicating it, or storing derived values that could be calculated from existing data.

Recommended learning order:

```text
React built-ins
  -> TanStack Query
  -> Zustand
  -> Redux Toolkit
  -> Jotai if you like atom-based state
```

Skip Recoil for new projects. The official repository was archived on January 1, 2025, the latest npm version is `0.7.7` from 2023, and the package describes itself as experimental. Learn Recoil only when maintaining an existing Recoil codebase.

Read [react.md](react.md) before this note. Read [nextjs.md](nextjs.md) when state crosses server/client boundaries.

## 1. First Question: What Kind Of State Is It?

Before choosing a library, classify the state.

```text
Button is open/closed                  local UI state
Selected tab in one page               local or URL state
Search query in product listing        URL state
Logged-in user from server             server state/session state
Todos loaded from database             server state
Draft input before submit              form/local state
Theme preference                       persistent low-risk UI state
Cart in ecommerce                      depends: server state or carefully persisted client state
Admin permission                       server-authorized state, not trusted client state
```

Good default:

```text
Keep state as close as possible to where it is used.
Lift state up only when multiple components need to coordinate.
Use URL state when refresh/share/back-button behavior matters.
Use server state tools for remote data.
Use global client state only when many distant components need the same client-owned value.
```

Avoid a global store for everything. A global store is convenient at first, but it can make ownership blurry.

## 2. React Built-ins

Start with React before adding libraries.

### `useState`

Use `useState` for simple local component memory.

```tsx
import { useState } from "react";

export function TodoDraft() {
  const [title, setTitle] = useState("");

  return (
    <label>
      Todo
      <input value={title} onChange={(event) => setTitle(event.target.value)} />
    </label>
  );
}
```

### Lift State Up

When two components need the same value, move state to their closest shared parent.

```tsx
import { useState } from "react";

function SearchInput({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <input
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
    />
  );
}

function SearchSummary({ query }: { query: string }) {
  return <p>Searching for: {query || "everything"}</p>;
}

export function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchInput query={query} onQueryChange={setQuery} />
      <SearchSummary query={query} />
    </>
  );
}
```

### `useReducer`

Use `useReducer` when state transitions have names or several fields change together.

```tsx
import { useReducer } from "react";

type State = {
  title: string;
  done: boolean;
};

type Action =
  | { type: "titleChanged"; title: string }
  | { type: "toggled" }
  | { type: "reset" };

const initialState: State = {
  title: "",
  done: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "titleChanged":
      return { ...state, title: action.title };
    case "toggled":
      return { ...state, done: !state.done };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function TodoEditor() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <form>
      <input
        value={state.title}
        onChange={(event) =>
          dispatch({ type: "titleChanged", title: event.target.value })
        }
      />
      <label>
        <input
          checked={state.done}
          type="checkbox"
          onChange={() => dispatch({ type: "toggled" })}
        />
        Done
      </label>
      <button type="button" onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
    </form>
  );
}
```

### Context

Use Context to pass stable shared values deeply, such as theme, current locale, or the current authenticated identity.

```tsx
import { createContext, useContext } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return theme;
}
```

Context is not automatically a performance tool. If a provider value changes often, every consumer may re-render. For frequently changing global client state, use Zustand, Jotai, or Redux Toolkit.

## 3. TanStack Query

TanStack Query manages server state: fetching, caching, background refetching, loading states, error states, mutations, retries, pagination, and invalidation.

Use it for:

```text
Todos from an API
User profile
Product lists
Search results
Pagination and infinite scroll
Mutations that should update cached data
Client-side dashboards that need refetching
```

Do not use it for:

```text
Button open/closed state
Form input before submit
Theme toggle
Purely local modal state
Secrets or authorization decisions
```

Install:

```sh
npm install @tanstack/react-query
```

Provider setup:

```tsx
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "@/app/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Query example:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos");

  if (!response.ok) {
    throw new Error("Failed to load todos");
  }

  return response.json();
}

export function TodoList() {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p>Loading todos...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

Mutation and invalidation:

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createTodo(title: string) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("Failed to create todo");
  }

  return response.json();
}

export function AddTodoButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate("Learn TanStack Query")}
    >
      {mutation.isPending ? "Saving..." : "Add todo"}
    </button>
  );
}
```

Good habits:

```text
Use stable query keys.
Throw from query functions when the response is not ok.
Set staleTime deliberately for data that does not need instant refetching.
Invalidate affected queries after mutations.
Use optimistic updates only when rollback behavior is clear.
Keep authorization on the server; client caches are not security boundaries.
```

Next.js note:

- In App Router, prefer Server Components and Server Functions for server-owned data when SEO, first render, or security matters.
- Use TanStack Query in Client Components when the screen needs client-side cache behavior, background refetching, optimistic updates, polling, or rich mutation UX.
- Do not fetch private server data in the browser if it can stay on the server.

## 4. Zustand

Zustand is a small global client-state library with a hook-based API.

Use it for:

```text
Sidebar open/closed
Theme preference
Command palette state
Modal state
Selected item shared across distant components
Temporary UI settings
Lightweight app-wide client state
```

Do not use it for:

```text
Server cache that needs refetching and invalidation
Sensitive tokens or secrets
Form state that only one form owns
Values that belong in the URL
```

Install:

```sh
npm install zustand
```

Typed store:

```ts
// stores/ui-store.ts
import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleTheme: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  theme: "light",
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));
```

Use selectors so components only subscribe to the state they need.

```tsx
"use client";

import { useUiStore } from "@/stores/ui-store";

export function SidebarButton() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const openSidebar = useUiStore((state) => state.openSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);

  return (
    <button type="button" onClick={sidebarOpen ? closeSidebar : openSidebar}>
      {sidebarOpen ? "Close" : "Open"} sidebar
    </button>
  );
}
```

Persistence:

```ts
// stores/preferences-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PreferencesState = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "preferences",
    },
  ),
);
```

Persistence warning:

- Browser storage is readable by JavaScript.
- Do not store access tokens, secrets, private records, or permission decisions in persisted Zustand state.
- Persist only low-risk preferences unless the app has a careful security design.

Good habits:

```text
Keep stores small and named by responsibility.
Put actions in the store so updates are consistent.
Use selectors instead of reading the whole store.
Avoid duplicating server data already managed by TanStack Query or Next.js.
Reset temporary stores on logout when needed.
```

## 5. Redux Toolkit

Redux Toolkit is the modern official way to write Redux. Learn Redux Toolkit, not old hand-written Redux patterns first.

Use Redux Toolkit when:

```text
The app is large and many teams touch shared state.
You need strict update conventions.
You want excellent DevTools and action history.
State transitions are complex and benefit from named actions.
The job market or project already expects Redux.
```

Do not reach for Redux Toolkit just because a component needs state. It has more structure than Zustand, which is useful in large apps but heavy for small UI state.

Install:

```sh
npm install @reduxjs/toolkit react-redux
```

Store setup:

```ts
// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./todo-slice";

export const store = configureStore({
  reducer: {
    todos: todoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Slice:

```ts
// store/todo-slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type TodoState = {
  items: Todo[];
};

const initialState: TodoState = {
  items: [],
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    todoAdded: (state, action: PayloadAction<Todo>) => {
      state.items.push(action.payload);
    },
    todoToggled: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((item) => item.id === action.payload);

      if (todo) {
        todo.done = !todo.done;
      }
    },
  },
});

export const { todoAdded, todoToggled } = todoSlice.actions;
export default todoSlice.reducer;
```

Typed hooks:

```ts
// store/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

Provider:

```tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

Use in a component:

```tsx
"use client";

import { todoToggled } from "@/store/todo-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function TodoList() {
  const todos = useAppSelector((state) => state.todos.items);
  const dispatch = useAppDispatch();

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <button type="button" onClick={() => dispatch(todoToggled(todo.id))}>
            {todo.done ? "Done" : "Todo"}: {todo.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

Good habits:

```text
Use Redux Toolkit APIs: configureStore and createSlice.
Keep state serializable unless you have a deliberate exception.
Use selectors for derived reads.
Avoid putting every keystroke of local form state in Redux.
For server/API state, consider RTK Query or TanStack Query.
```

## 6. Jotai

Jotai is an atom-based state library. It is the closest modern alternative if you liked Recoil's atoms/selectors mental model.

Use Jotai when:

```text
You like small independent atoms.
Derived state is important.
Many distant components need tiny pieces of shared state.
You want fine-grained subscriptions without a large central store.
```

Install:

```sh
npm install jotai
```

Primitive and derived atoms:

```ts
// state/todo-atoms.ts
import { atom } from "jotai";

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export const todosAtom = atom<Todo[]>([]);

export const completedCountAtom = atom((get) => {
  return get(todosAtom).filter((todo) => todo.done).length;
});

export const addTodoAtom = atom(null, (get, set, title: string) => {
  const todos = get(todosAtom);

  set(todosAtom, [
    ...todos,
    {
      id: crypto.randomUUID(),
      title,
      done: false,
    },
  ]);
});
```

Use atoms:

```tsx
"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { addTodoAtom, completedCountAtom, todosAtom } from "@/state/todo-atoms";

export function TodoSummary() {
  const completedCount = useAtomValue(completedCountAtom);
  return <p>Completed: {completedCount}</p>;
}

export function AddTodo() {
  const addTodo = useSetAtom(addTodoAtom);

  return (
    <button type="button" onClick={() => addTodo("Learn Jotai")}>
      Add todo
    </button>
  );
}

export function TodoItems() {
  const [todos, setTodos] = useAtom(todosAtom);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

Good habits:

```text
Keep atoms small and named clearly.
Use derived atoms for calculated values.
Do not create atoms inside render unless you understand atom identity.
Avoid using Jotai as an API cache when TanStack Query fits better.
Persist only low-risk values.
```

## 7. Recoil

Recoil introduced a nice atom/selectors mental model:

```text
Atom      -> shared unit of state
Selector  -> derived value from atoms/selectors
```

Basic Recoil shape:

```tsx
import { atom, useRecoilState } from "recoil";

const fontSizeState = atom({
  key: "fontSizeState",
  default: 14,
});

function FontButton() {
  const [fontSize, setFontSize] = useRecoilState(fontSizeState);

  return (
    <button
      type="button"
      style={{ fontSize }}
      onClick={() => setFontSize((size) => size + 1)}
    >
      Bigger text
    </button>
  );
}
```

Why not learn it for new projects:

```text
Official GitHub repo was archived on January 1, 2025.
Latest npm version is 0.7.7 from 2023.
The package describes itself as experimental.
React and Next.js patterns have moved forward.
Jotai gives a healthier atom-based path today.
```

Learn Recoil only if:

```text
Your job/project already uses it.
You need to maintain or migrate a Recoil codebase.
You want historical context for atom-based React state libraries.
```

Migration direction:

```text
Recoil atoms/selectors -> Jotai atoms/derived atoms
Simple global state    -> Zustand
Large structured app   -> Redux Toolkit
Server state           -> TanStack Query or framework data fetching
```

## 8. Choosing The Right Tool

| Situation | First choice |
| --- | --- |
| One component owns it | `useState` |
| Complex local transitions | `useReducer` |
| Parent and child share it | Lift state up |
| Deep stable value | Context |
| Query string, filters, pagination, shareable state | URL/search params |
| API data, loading, error, cache, mutations | TanStack Query |
| Simple global client UI state | Zustand |
| Atom-based shared client state | Jotai |
| Large enterprise shared state | Redux Toolkit |
| Existing legacy Recoil project | Recoil maintenance only |
| Next.js server-owned data | Server Components, Server Functions, Route Handlers |

Short recommendation:

```text
Small React app:
  React state + maybe Zustand

API-heavy React app:
  React state + TanStack Query + maybe Zustand

Next.js App Router app:
  Server Components/Functions first
  TanStack Query for client-side server state
  Zustand/Jotai for browser-only shared UI state

Large company app:
  React state + TanStack Query/RTK Query + Redux Toolkit
```

## 9. URL State

Use URL state when users should be able to refresh, bookmark, share, or use the back button.

Good URL state:

```text
search query
page number
sort order
selected category
tab in a dashboard
modal route when it represents a real resource
```

React Router or Next.js can read and update search params. In Next.js App Router:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";

  function updateSort(nextSort: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", nextSort);
    router.push(`?${params.toString()}`);
  }

  return (
    <select value={sort} onChange={(event) => updateSort(event.target.value)}>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}
```

Do not put secrets, tokens, private IDs, or large JSON blobs into URLs.

## 10. Form State

Most form state should stay near the form.

Use:

```text
Controlled inputs       when UI must respond to every change.
Uncontrolled forms      when values are read on submit.
React Hook Form         for larger forms, validation, errors, and performance.
Zod                     for runtime validation, especially server boundaries.
Server Functions        for Next.js form mutations.
```

Avoid putting every input value into Zustand or Redux. It makes normal form behavior harder to reason about and can cause unnecessary renders.

Example with server-side validation belongs in [nextjs.md](nextjs.md) and [libraries.md](libraries.md).

## 11. Persistence

Prefer server persistence for important data.

```text
Database       important user/business data
Cookie         session identifiers and small server-controlled values
localStorage   low-risk UI preferences
sessionStorage temporary browser-tab state
IndexedDB      larger offline/local-first data
```

Persistence warnings:

```text
localStorage is readable by JavaScript.
Do not store high-value access tokens casually.
Do not store authorization decisions as trusted state.
Clear user-specific client stores on logout.
Version persisted state if the shape may change.
Handle missing/corrupt persisted values.
```

## 12. Production Checklist

```text
State ownership is clear.
Server state is not duplicated into client stores unnecessarily.
Derived state is calculated instead of stored.
Global stores do not contain secrets.
Persisted browser state is low-risk and versioned where needed.
Logout clears sensitive user-specific state.
API mutations validate input on the server.
Authorization happens on the server for every protected action.
Loading, empty, error, success, and refetching states are visible in the UI.
Query keys are stable and invalidation is deliberate.
DevTools are enabled in development and safe in production.
Tests cover key state transitions and protected flows.
```

## 13. Practice Path

1. Build a counter with `useState`.
2. Build a todo editor with `useReducer`.
3. Lift search state from an input to a parent summary.
4. Put theme in Context.
5. Put sort and page filters in URL search params.
6. Fetch todos with TanStack Query.
7. Add a todo with `useMutation` and invalidate the todo query.
8. Put sidebar/modal state in Zustand.
9. Persist only a theme preference with Zustand middleware.
10. Build one atom and one derived atom with Jotai.
11. Rebuild the same todo state with Redux Toolkit.
12. In a Next.js app, move server-owned data back to Server Components or Server Functions.

## 14. Interview Questions and Answers

### 1. What is the difference between client state and server state?

Client state is owned by the browser UI, such as a modal being open. Server state is owned by a backend or database and must be fetched, cached, synchronized, and updated carefully.

### 2. When should you use Context?

Use Context for values many components need, especially stable values like theme, locale, or current session identity. Avoid using one frequently changing Context value for a large app-wide store.

### 3. Why is TanStack Query not the same as Zustand?

TanStack Query manages async server state and cache invalidation. Zustand manages client-owned state. They solve different problems and often work together.

### 4. When should you choose Redux Toolkit?

Choose Redux Toolkit for large apps that need strict conventions, strong DevTools, predictable named actions, and team-friendly structure.

### 5. What is the closest modern alternative to Recoil?

Jotai, because it uses an atom-based model with derived atoms and fine-grained subscriptions.

### 6. Why skip Recoil for new projects?

The official repository is archived, the latest stable npm release is old, and the package is experimental. New projects should choose maintained tools.

### 7. Should form inputs live in a global store?

Usually no. Keep form state local or use a form library. Send validated values to the server on submit.

### 8. Should permissions live in client state?

The UI can display permission-based hints, but the server must enforce authorization. Client state is not a security boundary.

### 9. What is derived state?

Derived state is calculated from existing state, such as completed todo count. Prefer calculating it instead of storing a duplicate value that can become stale.

### 10. What should you use in Next.js App Router?

Use Server Components and Server Functions for server-owned data first. Use TanStack Query for client-side server-state needs. Use Zustand or Jotai for browser-only shared UI state.

## Quick Reference

```text
useState          local simple state
useReducer        local complex transitions
Context           deep shared values
TanStack Query    server state and mutations
Zustand           simple global client state
Redux Toolkit     large structured client state
Jotai             atom-based client state
Recoil            maintenance only
URL params        shareable navigation state
React Hook Form   larger form state
```

## Resources

- React Managing State: https://react.dev/learn/managing-state
- React Sharing State Between Components: https://react.dev/learn/sharing-state-between-components
- TanStack Query React Overview: https://tanstack.com/query/latest/docs/framework/react/overview
- TanStack Query SSR and Next.js: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
- Zustand docs: https://zustand.docs.pmnd.rs/
- Redux Toolkit overview: https://redux.js.org/redux-toolkit/overview
- Jotai docs: https://jotai.org/
- Recoil GitHub repository: https://github.com/facebookexperimental/Recoil
- Recoil npm package: https://www.npmjs.com/package/recoil

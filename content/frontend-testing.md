# Frontend Testing Learning Notes

Frontend testing proves that the UI behaves correctly for users, not just that components render without crashing.

Good frontend tests answer practical questions:

```text
Can the user complete the flow?
Does the UI show loading, empty, error, and success states?
Can keyboard and screen-reader users operate it?
Are API responses mocked in a realistic way?
Will a visual or layout regression be noticed before release?
```

Read [react.md](react.md) first for component fundamentals. Read [frontend-design.md](frontend-design.md) for UI library choices, [ui-patterns.md](ui-patterns.md) for common states and screen recipes, [shadcn.md](shadcn.md) for component workflow, [nextjs.md](nextjs.md) for App Router boundaries, and [browser-tools.md](browser-tools.md) for manual debugging.

## 1. Testing Pyramid For Frontend

Use multiple layers. Each layer catches different problems.

```text
Static checks          TypeScript, ESLint, formatting
Unit tests             pure helpers, validation, data mappers
Component tests        UI states, forms, accessibility-oriented behavior
Integration tests      component + router/query/client state/API mocks
E2E tests              critical user flows in a real browser
Visual tests           layout, spacing, theme, responsive regressions
Manual QA              judgment, copy, assistive tech, real-device checks
```

The goal is not maximum test count. The goal is high confidence around important behavior.

## 2. What To Test

Test behavior users and the business depend on.

Good targets:

```text
Forms submit valid data and show field errors.
Disabled and loading states prevent duplicate actions.
Auth redirects protect private pages.
Users cannot access another user's data.
Filters, sorting, search, and pagination change visible results.
Dialogs trap focus and close correctly.
Keyboard users can complete the workflow.
API errors show useful recovery states.
Empty states explain what happened and what to do next.
```

Weak targets:

```text
Component internal state names.
Exact implementation structure.
Private helper calls when visible behavior already proves the outcome.
Snapshots of large markup trees.
CSS class strings that change during harmless refactors.
```

## 3. Choosing The Right Tool

```text
Pure function or schema         Vitest unit test
React component behavior        Testing Library + user-event
Network-dependent component     Testing Library + MSW
Critical route/user journey     Playwright
Hard-to-reach component state   Storybook
Visual regression               Storybook/Chromatic or Playwright screenshot
Accessibility smoke checks      axe with Playwright or Storybook addon
Manual browser investigation    Chrome DevTools
```

Default modern React stack:

```text
Vitest
Testing Library
user-event
jest-dom matchers
MSW
Playwright
Storybook when components repeat
Chromatic or screenshot checks when visual regressions matter
```

## 4. Vitest

Vitest is a fast test runner that fits Vite and modern TypeScript projects well.

Use Vitest for:

```text
helpers
hooks with simple wrappers
validation schemas
data mappers
component tests in jsdom
fast feedback during development
```

Setup:

```sh
# Changes dev dependencies
npm install -D vitest

# DOM component tests: changes dev dependencies
npm install -D jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Example package scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```

Example config:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Example setup file:

```ts
import "@testing-library/jest-dom/vitest";
```

Unit test example:

```ts
import { expect, test } from "vitest";
import { formatPrice } from "./format-price";

test("formats USD prices", () => {
  expect(formatPrice(1299, "USD")).toBe("$12.99");
});
```

Keep unit tests small and boring. If the test needs many mocks, the unit may be doing too much.

## 5. Testing Library

Testing Library helps test components through user-visible behavior.

Prefer queries in this order:

```text
getByRole
getByLabelText
getByPlaceholderText
getByText
getByDisplayValue
getByAltText
getByTitle
getByTestId only when no user-facing query fits
```

Component example:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { NewsletterForm } from "./newsletter-form";

test("submits an email address", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<NewsletterForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "a@example.com");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));

  expect(onSubmit).toHaveBeenCalledWith({ email: "a@example.com" });
});
```

Async UI example:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { UserCard } from "./user-card";

test("shows loaded user details", async () => {
  render(<UserCard userId="u1" />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
});
```

Use `userEvent.setup()` for realistic interactions. It simulates full interactions better than low-level event dispatch.

## 6. MSW For API Mocking

MSW mocks network requests at the request layer. That keeps app code realistic because components still call `fetch`, Axios, TanStack Query, or whatever client the app normally uses.

Use MSW for:

```text
component tests with API calls
Storybook states that need fake API data
Playwright flows when a real backend is not wanted
local development demos
error and slow-network reproduction
```

Setup:

```sh
# Changes dev dependencies
npm install -D msw
```

Handlers:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/user/:id", ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: "Ada Lovelace",
    });
  }),
];
```

Vitest server setup:

```ts
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Override one test:

```ts
import { http, HttpResponse } from "msw";
import { server } from "./server";

test("shows an error state", async () => {
  server.use(
    http.get("/api/user/:id", () => {
      return HttpResponse.json({ message: "Failed" }, { status: 500 });
    }),
  );

  // render component and assert the visible error
});
```

Use `onUnhandledRequest: "error"` in tests. Silent unmocked requests make tests less trustworthy.

## 7. Playwright

Playwright runs real browser tests. Use it for flows that must work across routes, auth, navigation, storage, forms, and browser behavior.

Use Playwright for:

```text
signup and login
checkout or payment handoff
dashboard filters
file uploads
auth redirects
permissions and authorization flows
multi-page flows
critical mobile viewport checks
```

Setup:

```sh
# Writes files and changes dev dependencies
npm init playwright@latest

# Run all E2E tests
npx playwright test

# Open interactive UI mode
npx playwright test --ui

# Run headed for debugging
npx playwright test --headed

# Show the HTML report
npx playwright show-report
```

Example:

```ts
import { expect, test } from "@playwright/test";

test("user can filter invoices", async ({ page }) => {
  await page.goto("/dashboard/invoices");

  await page.getByRole("textbox", { name: /search/i }).fill("acme");

  await expect(page.getByRole("table")).toContainText("Acme Corp");
  await expect(page.getByRole("table")).not.toContainText("Globex");
});
```

Accessibility smoke check:

```ts
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("dashboard has no obvious accessibility violations", async ({ page }) => {
  await page.goto("/dashboard");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

Install axe helper:

```sh
# Changes dev dependencies
npm install -D @axe-core/playwright
```

Automated accessibility checks are useful, but incomplete. They do not replace keyboard testing, screen-reader checks, color review, and human judgment.

## 8. Storybook

Storybook documents components in isolation. It is most useful when components have variants, states, and reviewers.

Use Storybook for:

```text
buttons, inputs, dialogs, menus, tables, cards, charts
loading, empty, error, and success states
theme and density variants
design review
component API documentation
visual regression baselines
```

Setup:

```sh
# Writes files and changes dev dependencies
npm create storybook@latest

# Run Storybook if the script exists
npm run storybook

# Build static Storybook if the script exists
npm run build-storybook
```

Story example:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
  component: Button,
  args: {
    children: "Save",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Loading: Story = {
  args: {
    children: "Saving...",
    disabled: true,
  },
};
```

Interaction story:

```tsx
import { expect, userEvent, within } from "@storybook/test";

export const OpensMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /open/i }));

    await expect(canvas.getByRole("menu")).toBeVisible();
  },
};
```

Do not add Storybook for every tiny project. Add it when isolated component states save time for engineers, designers, QA, or product review.

## 9. Visual Regression Testing

Visual tests catch bugs that functional assertions often miss:

```text
button hidden behind sticky footer
dark mode unreadable
table columns crushed on mobile
modal overflow broken
font or spacing changed unexpectedly
empty state layout collapsed
```

Common options:

```text
Storybook + Chromatic          strongest component visual workflow
Playwright screenshots         useful for page-level checks
Manual screenshots             acceptable for small projects
Percy/Loki/other tools         team-specific alternatives
```

Chromatic setup for Storybook:

```sh
# Writes config and changes dev dependencies
npx storybook@latest add @chromatic-com/storybook
```

Visual tests need stable inputs. Freeze dates, seed data, avoid random IDs in visible UI, and use deterministic images where possible.

## 10. Testing Forms

Forms deserve careful testing because they combine input, validation, accessibility, state, network, and error handling.

Test:

```text
required field errors
invalid format errors
successful submission
server validation errors
loading and disabled states
duplicate submit prevention
focus movement after errors
keyboard-only completion
```

Example:

```tsx
test("shows validation errors before submitting", async () => {
  const user = userEvent.setup();

  render(<SignupForm />);

  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toHaveFocus();
});
```

Client validation is for UX. Server validation is for trust.

## 11. Testing Next.js Apps

Next.js has multiple boundaries:

```text
Server Components
Client Components
Server Functions
Route Handlers
cookies and headers
redirects and not-found behavior
cache and revalidation
```

Good defaults:

```text
Pure helpers and schemas        Vitest
Client Components              Testing Library
Route Handlers                 Request/Response tests
Server Functions               direct tests with mocked auth/database boundaries
Full App Router flows           Playwright
Auth redirects                  Playwright
Cache-sensitive behavior        focused integration/E2E tests
```

Do not try to component-test every Server Component. Often the better test is a lower-level data function test plus a Playwright flow that proves the rendered route works.

## 12. Accessibility Testing

Automated checks catch many issues, but not all.

Automated checks can catch:

```text
missing labels
invalid ARIA
some color contrast issues
duplicate IDs
landmark problems
some keyboard/focus issues
```

Manual checks still need to verify:

```text
keyboard-only completion
focus order
visible focus indicators
screen-reader meaning
copy clarity
zoom and responsive behavior
error recovery
```

Practical checklist:

```text
Use role and label queries in tests.
Tab through the important flow.
Check that dialogs receive and return focus.
Check that errors are announced or clearly associated.
Run axe on key pages.
Review color contrast in light and dark mode.
```

## 13. CI Strategy

Recommended CI order:

```text
install dependencies
type-check
lint
unit/component tests
production build
Playwright smoke flows
Storybook build if used
visual regression if used
```

Keep CI fast by splitting jobs:

```text
Fast PR checks         type-check, lint, Vitest
Critical browser      Playwright smoke tests
Full browser matrix   scheduled or protected-branch tests
Visual tests          PR checks when UI risk is high
```

Treat flaky tests as broken tests. A flaky test teaches the team to ignore CI.

## 14. Common Mistakes

### Testing Implementation Instead Of Behavior

Avoid checking private state or internal function calls when visible behavior is enough.

### Mocking Too Deeply

If every dependency is mocked, the test may only prove that mocks work. Mock at boundaries: network, time, browser APIs, auth, and storage.

### Forgetting Error States

Happy paths are not enough. Test invalid input, empty API data, 401, 403, 404, 500, timeout, and retry paths when they matter.

### Overusing Snapshots

Large snapshots are noisy. Prefer specific assertions and visual regression tools for appearance.

### Skipping Keyboard Testing

Mouse-only testing misses accessibility and real productivity problems.

### Making E2E Tests Too Broad

One giant test is hard to debug. Prefer focused flows with clear setup and assertions.

## 15. Production Checklist

```text
Critical user flows have Playwright coverage.
Important forms test validation, submission, and server errors.
Component states have tests or Storybook stories.
Network calls in tests use MSW or explicit test fixtures.
Accessibility smoke checks run on important pages.
Visual regression exists for UI that changes often or matters commercially.
Tests avoid real secrets and production services.
CI runs tests in a predictable order.
Flaky tests are fixed or removed quickly.
Manual QA covers keyboard, responsive, copy, and edge states.
```

## 16. Commands To Remember

```sh
# Vitest: changes dev dependencies
npm install -D vitest

# DOM/component test stack: changes dev dependencies
npm install -D jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# MSW: changes dev dependencies
npm install -D msw

# Playwright setup: writes files and changes dev dependencies
npm init playwright@latest

# Playwright run
npx playwright test

# Playwright UI/debug
npx playwright test --ui
npx playwright test --headed
npx playwright show-report

# Storybook setup: writes files and changes dev dependencies
npm create storybook@latest

# Storybook visual tests addon: writes config and changes dev dependencies
npx storybook@latest add @chromatic-com/storybook

# Accessibility checks with Playwright: changes dev dependencies
npm install -D @axe-core/playwright
```

## 17. Practice Path

1. Test a pure `formatPrice` helper with Vitest.
2. Test a counter with Testing Library and `user-event`.
3. Test a form with required fields, invalid input, and successful submit.
4. Mock a user API with MSW and test loading, success, and error states.
5. Write a Playwright test for login or dashboard filtering.
6. Add Storybook stories for a button, dialog, form field, and empty state.
7. Add one axe check for a critical page.
8. Add one visual regression path for a repeated component or page.

## Resources

- Vitest: https://vitest.dev/guide/
- Vitest features and jsdom notes: https://vitest.dev/guide/features
- Testing Library user-event setup: https://testing-library.com/docs/user-event/setup/
- Testing Library user-event install: https://testing-library.com/docs/user-event/install/
- MSW: https://mswjs.io/
- Playwright installation: https://playwright.dev/docs/intro
- Playwright CLI: https://playwright.dev/docs/test-cli
- Playwright accessibility testing: https://playwright.dev/docs/accessibility-testing
- Storybook install: https://storybook.js.org/docs/get-started/install
- Storybook testing: https://storybook.js.org/docs/writing-tests
- Storybook visual testing: https://storybook.js.org/docs/writing-tests/visual-testing
- Chromatic visual tests: https://www.chromatic.com/docs/visual/

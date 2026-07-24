# Tailwind CSS Learning Notes

Tailwind CSS is a utility-first CSS framework. Instead of writing many custom class names first, you compose small utility classes directly in your markup.

```text
Traditional CSS
  -> invent class name
  -> write CSS rule
  -> switch between component and stylesheet

Tailwind
  -> use existing utilities
  -> keep layout, spacing, color, and states near the markup
  -> extract components when patterns repeat
```

Tailwind is not a replacement for CSS knowledge. It is a faster way to apply CSS once you understand layout, spacing, typography, color, responsive design, and accessibility.

Read [frontend-design.md](frontend-design.md) first for design foundations. Read [color.md](color.md) for palette, contrast, dark mode, and token guidance. Read [shadcn.md](shadcn.md) when you want reusable Tailwind components with accessible primitives.

## 1. When To Use Tailwind

Use Tailwind when:

```text
You want fast UI iteration.
You want consistent spacing, color, font, shadow, and radius tokens.
Your team is comfortable reading utility classes in JSX/HTML.
You are building React, Next.js, dashboards, SaaS UI, landing pages, or internal tools.
You want a good base for shadcn/ui or custom component systems.
```

Avoid or be careful when:

```text
The project already has a mature CSS system.
The team strongly prefers semantic CSS class names.
You need very small static HTML with no build step.
You are copying random utility soup without understanding CSS.
```

Good Tailwind code still has design discipline. Utility classes do not automatically create hierarchy, alignment, accessible states, or good spacing.

## 2. Setup

These notes assume current Tailwind CSS v4-style setup. Tailwind v3 projects use a more JavaScript-config-centered setup with `tailwind.config.js`; check the installed version before copying commands.

### Vite

Create a React app if needed:

```sh
# Writes files and installs dependencies
npm create vite@latest my-app -- --template react-ts
cd my-app
```

Install Tailwind and the Vite plugin:

```sh
# Changes dependencies
npm install tailwindcss @tailwindcss/vite
```

Configure Vite:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Import Tailwind in your CSS:

```css
/* src/index.css */
@import "tailwindcss";
```

### Next.js

Install Tailwind and the PostCSS plugin:

```sh
# Changes dependencies
npm install -D tailwindcss @tailwindcss/postcss
```

Configure PostCSS:

```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Import Tailwind in global CSS:

```css
/* app/globals.css */
@import "tailwindcss";
```

Import the global CSS from the root layout:

```tsx
// app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## 3. Mental Model

Tailwind utilities map to CSS declarations.

```html
<button class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">
  Save
</button>
```

Means roughly:

```css
button {
  border-radius: 0.375rem;
  background-color: ...;
  padding-inline: 0.75rem;
  padding-block: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}
```

The point is not to avoid CSS. The point is to reuse a shared design scale and keep common styling close to the component.

## 4. Everyday Utilities

### Layout

```tsx
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-6">
      {children}
    </main>
  );
}
```

Common layout utilities:

```text
block, inline, flex, grid, hidden
items-center, justify-between, gap-4
grid-cols-1, md:grid-cols-2, lg:grid-cols-3
mx-auto, max-w-6xl, min-h-screen
overflow-hidden, overflow-auto
relative, absolute, sticky, inset-0
```

### Spacing

```tsx
export function Stack({ children }: { children: React.ReactNode }) {
  return <section className="space-y-4">{children}</section>;
}
```

Use spacing rhythm deliberately:

```text
gap-1 or gap-2      icon/text or compact controls
gap-3 or gap-4      normal form and card spacing
gap-6 or gap-8      page sections
px-3 py-2           common button padding
p-4 or p-6          common panel padding
```

### Typography

```tsx
export function SectionHeader() {
  return (
    <header>
      <h2 className="text-lg font-semibold text-gray-950">Invoices</h2>
      <p className="mt-1 text-sm text-gray-600">Review recent billing activity.</p>
    </header>
  );
}
```

Useful text utilities:

```text
text-sm, text-base, text-lg, text-2xl
font-medium, font-semibold, font-bold
leading-6, leading-tight
text-gray-950, text-gray-600
truncate, line-clamp-2 when configured
tabular-nums for aligned numbers
```

### Borders, Radius, and Shadows

```tsx
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {children}
    </section>
  );
}
```

Use shadows sparingly. In dense tools, borders and background contrast are often clearer than large shadows.

## 5. State Variants

Variants apply a utility only in a state.

```tsx
export function ActionButton() {
  return (
    <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
      Save
    </button>
  );
}
```

Common variants:

```text
hover:
focus:
focus-visible:
active:
disabled:
aria-checked:
aria-expanded:
data-[state=open]:
dark:
motion-safe:
motion-reduce:
```

Do not remove focus styles. If the default outline looks wrong, replace it with a visible design-approved focus ring.

## 6. Responsive Design

Tailwind breakpoints are mobile-first. Unprefixed classes apply to all sizes; prefixed classes apply from that breakpoint upward.

```tsx
export function DashboardLayout() {
  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">Sidebar</aside>
      <main className="min-w-0">Content</main>
    </div>
  );
}
```

Default breakpoint prefixes:

```text
sm   40rem
md   48rem
lg   64rem
xl   80rem
2xl  96rem
```

Mobile-first example:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" />
```

For component-based responsiveness, use container queries:

```tsx
export function MetricCard() {
  return (
    <article className="@container rounded-lg border p-4">
      <div className="flex flex-col gap-2 @md:flex-row @md:items-end @md:justify-between">
        <h3 className="text-sm text-gray-600">Revenue</h3>
        <p className="text-2xl font-semibold">$12,480</p>
      </div>
    </article>
  );
}
```

## 7. Theme Tokens

In Tailwind v4, project tokens can be defined in CSS with `@theme`. Theme variables create utility classes.

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #eff6ff;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
  --radius-control: 0.5rem;
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

Now these classes can exist:

```html
<button class="rounded-control bg-brand-600 text-white hover:bg-brand-700">
  Save
</button>
```

Use `@theme` for tokens that should generate utilities. Use normal CSS variables for values that do not need utility classes.

```css
:root {
  --app-header-height: 4rem;
}
```

## 8. Dark Mode

Tailwind supports `dark:` utilities. By default, dark mode follows system preference. For manual class-based dark mode, define a custom dark variant:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Then toggle the class above your app:

```html
<html class="dark">
  <body>
    <main class="bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      ...
    </main>
  </body>
</html>
```

In Next.js, render the initial theme class on the server or add a small inline script early enough to avoid a theme flash.

## 9. Arbitrary Values

Use arbitrary values for one-off cases:

```tsx
<div className="grid grid-cols-[16rem_minmax(0,1fr)]" />
<div className="max-h-[calc(100vh-4rem)] overflow-auto" />
```

Do not use arbitrary values as a replacement for a design scale. If a value repeats, promote it to a token or component.

## 10. Reusing Classes

Tailwind repetition is usually solved by components, not by inventing many CSS classes.

```tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={[
        "rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white",
        "hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
```

For class composition in real React apps, use `clsx` and `tailwind-merge`:

```sh
# Changes dependencies
npm install clsx tailwind-merge
```

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
import { cn } from "@/lib/cn";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("rounded-full bg-gray-100 px-2 py-1 text-xs", className)}>
      {children}
    </span>
  );
}
```

Use `class-variance-authority` when variants become part of a component API.

## 11. Forms

```tsx
export function EmailField() {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-gray-900">Email</span>
      <input
        className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        name="email"
        type="email"
      />
      <span className="text-sm text-gray-600">Use your work email.</span>
    </label>
  );
}
```

Form checklist:

```text
Use labels.
Show help text and errors near the field.
Use visible focus styles.
Do not rely on placeholder text as the only label.
Style invalid, disabled, pending, and success states.
Validate again on the server.
```

## 12. Tables and Dashboards

Dense UI needs restraint.

```tsx
export function InvoiceTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          <tr>
            <td className="px-4 py-3 font-medium text-gray-950">INV-001</td>
            <td className="px-4 py-3 text-gray-600">Paid</td>
            <td className="px-4 py-3 text-right tabular-nums">$240.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

For big tables, combine Tailwind with [TanStack Table](frontend-design.md#8-tables-charts-and-dashboards), AG Grid, or a component library.

## 13. Common Mistakes

### Treating Tailwind as Design

Tailwind gives utilities. You still need spacing, hierarchy, contrast, and workflow decisions.

### Overusing `@apply`

Use `@apply` sparingly. If a pattern repeats in React, prefer a component. If it is a global element style, CSS can be fine.

### Building Giant Class Strings

Long class strings are acceptable when they describe a real component, but if every instance repeats the same string, extract a component.

### Random Arbitrary Values

`mt-[13px]` can be useful once. If it appears everywhere, your spacing system is drifting.

### Dynamic Class Names That Tailwind Cannot See

Avoid building class names from partial strings:

```tsx
// Avoid: Tailwind may not detect the final classes.
const className = `bg-${color}-600`;
```

Map variants to complete class names:

```tsx
const tones = {
  blue: "bg-blue-600 text-white",
  gray: "bg-gray-100 text-gray-950",
};
```

### Removing Native Semantics

Tailwind makes anything look clickable. Use real `<button>`, `<a>`, `<input>`, `<label>`, and table elements.

## 14. Production Checklist

```text
Classes are readable enough to maintain.
Repeated patterns are extracted into components.
Responsive behavior is checked at small, medium, large, and wide screens.
Text does not overflow controls.
Focus styles are visible.
Color contrast is readable.
Dark mode works if supported.
Reduced motion is respected.
Generated class names are statically detectable or safelisted with the current Tailwind mechanism.
Third-party component paths are included with @source if automatic detection misses them.
Design tokens use @theme when utilities should be generated.
No secret values or environment-specific URLs are embedded in CSS.
```

## 15. Commands To Remember

```sh
# Vite setup: changes dependencies
npm install tailwindcss @tailwindcss/vite

# Next.js/PostCSS setup: changes dependencies
npm install -D tailwindcss @tailwindcss/postcss

# Class composition helpers: changes dependencies
npm install clsx tailwind-merge

# Variant helper: changes dependencies
npm install class-variance-authority
```

## Resources

- Tailwind CSS docs: https://tailwindcss.com/docs
- Vite installation: https://tailwindcss.com/docs/installation/using-vite
- Theme variables: https://tailwindcss.com/docs/theme
- Functions and directives: https://tailwindcss.com/docs/functions-and-directives
- Responsive design: https://tailwindcss.com/docs/responsive-design
- Dark mode: https://tailwindcss.com/docs/dark-mode
- Next.js CSS guide: https://nextjs.org/docs/app/getting-started/css
- UI color guide: [color.md](color.md)

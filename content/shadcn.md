# shadcn/ui Learning Notes

shadcn/ui is a collection of component recipes and a CLI that copies component source code into your project. It is not a traditional component library that you only import from `node_modules`.

```text
Traditional library
  -> install package
  -> import component
  -> customize through props/theme API

shadcn/ui
  -> run CLI
  -> component source is written into your app
  -> you own and edit the component code
```

shadcn/ui is popular for modern React and Next.js apps because it combines Tailwind CSS, accessible primitives, local component ownership, and a polished default style.

Read [tailwind.md](tailwind.md) before this note. Read [color.md](color.md) for palette, contrast, dark mode, and theme-token guidance. Read [frontend-design.md](frontend-design.md) for design foundations and other UI library choices. Read [ui-patterns.md](ui-patterns.md) for product screen recipes that use these components.

## 1. When To Use shadcn/ui

Use shadcn/ui when:

```text
You want good-looking components quickly.
You want component source code in your repository.
You are comfortable with Tailwind CSS.
You want accessible primitives for dialogs, dropdowns, popovers, tabs, and forms.
You are building a SaaS app, dashboard, admin tool, or polished prototype.
```

Avoid or be careful when:

```text
You want a normal package where updates happen automatically.
You do not want to maintain copied component code.
Your project cannot use Tailwind CSS.
Your team needs a strict enterprise design system such as MUI, Ant Design, or Fluent UI.
You plan to add every component without understanding the generated files.
```

The biggest mental shift: after the CLI writes a component, it is your component.

## 2. Setup

For a new or existing React project, initialize shadcn/ui:

```sh
# Writes files and changes dependencies
npx shadcn@latest init
```

Add a component:

```sh
# Writes component files and may install dependencies
npx shadcn@latest add button
```

Add multiple components:

```sh
# Writes component files and may install dependencies
npx shadcn@latest add button dialog dropdown-menu form input
```

Create a new project from a supported template:

```sh
# Writes files and installs dependencies
npx shadcn@latest init --template next --name my-app
```

The current CLI can work with common React frameworks such as Next.js, Vite, React Router, Astro, Laravel, TanStack Start, and related templates. Pick the framework-specific path in the official docs when setting up a real app.

## 3. What The CLI Creates

Typical files:

```text
components.json
components/ui/button.tsx
components/ui/dialog.tsx
lib/utils.ts
app/globals.css or src/index.css
package.json dependency updates
```

The exact paths depend on your framework, aliases, and CLI answers.

Typical utility:

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`cn` lets components combine default Tailwind classes, conditional classes, and caller overrides without keeping conflicting utilities.

## 4. `components.json`

`components.json` tells the CLI how your project is structured.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Important fields:

```text
style          Visual style preset. Current docs recommend new-york; old default style is deprecated.
rsc            Whether React Server Component conventions should be used.
tsx            Whether generated files use TypeScript.
tailwind.css   CSS file where theme variables and Tailwind imports live.
tailwind.config For Tailwind v4, leave blank unless your project uses a legacy config.
cssVariables   Recommended for theme tokens.
aliases        Import paths the CLI writes into generated components.
```

If imports break after adding a component, check that `components.json` aliases match `tsconfig.json` or `jsconfig.json` paths.

## 5. Component Anatomy

A simple generated component usually combines:

```text
React component
Tailwind class string
cn helper
variants through class-variance-authority when needed
accessible primitive dependency when the pattern is interactive
```

Button-style shape:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

Do not memorize this exact code. Learn the pattern:

```text
base classes
variant classes
size classes
default variants
caller className
semantic element
```

## 6. Using Components

After adding a component, import it from your local project:

```tsx
import { Button } from "@/components/ui/button";

export function SaveChanges() {
  return <Button>Save changes</Button>;
}
```

Dialog shape:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This removes the project for everyone on your team.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

Many interactive components use `asChild` to let the primitive pass behavior to your own element. Make sure the child is a real interactive element when appropriate.

## 7. Theming

shadcn/ui commonly uses CSS variables for semantic tokens.

```css
@import "tailwindcss";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);
}
```

Treat these as product tokens:

```text
background
foreground
primary
secondary
muted
accent
destructive
border
input
ring
radius
```

Do not hardcode random colors into every component if the design should be themeable. Prefer semantic tokens for shared UI.

## 8. Tailwind v4 Notes

With Tailwind v4, much configuration moved into CSS. In `components.json`, `tailwind.config` can be blank for v4 projects.

```json
{
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "cssVariables": true
  }
}
```

When using Tailwind v3 or an older shadcn setup, you may see `tailwind.config.ts`, `tailwindcss-animate`, and older CLI commands in examples. Do not blindly mix v3 and v4 setup snippets.

## 9. Server and Client Components

In Next.js App Router:

```text
Static visual components can often be Server Components.
Components using state, effects, browser events, or client-only primitives need "use client".
The shadcn CLI may add "use client" where a component needs it.
Do not import server-only code into client components.
```

Safe pattern:

```tsx
// app/projects/page.tsx
import { ProjectActions } from "./project-actions";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main>
      <ProjectActions />
      {/* render project list */}
    </main>
  );
}
```

```tsx
// app/projects/project-actions.tsx
"use client";

import { Button } from "@/components/ui/button";

export function ProjectActions() {
  return <Button onClick={() => console.log("open")}>New project</Button>;
}
```

## 10. Forms

shadcn/ui form examples commonly pair React Hook Form and Zod.

```sh
# Changes dependencies
npx shadcn@latest add form input button
npm install react-hook-form zod @hookform/resolvers
```

Example shape:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export function EmailForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && <p>{form.formState.errors.email.message}</p>}
      <button type="submit">Save</button>
    </form>
  );
}
```

Client validation is UX. Repeat validation and authorization on the server.

## 11. Customizing Components

Good customizations:

```text
Rename variants to match product language.
Add sizes that the product actually uses.
Adjust spacing and typography to match the design system.
Wrap low-level components in product-specific components.
Keep semantic HTML and accessibility behavior intact.
```

Risky customizations:

```text
Removing focus-visible styles.
Replacing buttons with clickable divs.
Deleting labels or descriptions from form fields.
Changing dialog markup without checking focus behavior.
Adding many one-off variants that no screen consistently uses.
Overwriting generated files without reviewing local edits.
```

Product wrapper example:

```tsx
import { Badge } from "@/components/ui/badge";

type Status = "paid" | "pending" | "failed";

const statusTone = {
  paid: "bg-green-50 text-green-700 ring-green-600/20",
  pending: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
};

export function InvoiceStatus({ status }: { status: Status }) {
  return (
    <Badge className={statusTone[status]} variant="outline">
      {status}
    </Badge>
  );
}
```

## 12. Updating Components

Because components are copied into your project, updates are not automatic.

Safe update workflow:

```text
Check git status before adding or updating components.
Read the generated diff.
Keep local product changes unless you intentionally replace them.
Update related dependencies deliberately.
Test keyboard, focus, forms, dialogs, and responsive states.
Commit component updates separately from product feature work when possible.
```

Useful commands:

```sh
# Read-only: inspect local changes first
git status --short

# Writes files and may install dependencies
npx shadcn@latest add button

# Writes files; use carefully if component already exists
npx shadcn@latest add button --overwrite
```

Use `--overwrite` only when you are intentionally replacing local component code.

## 13. Common Components To Learn First

```text
button          actions and links styled as buttons
input           text fields
label           accessible labels
textarea        long-form input
select          option selection
checkbox        binary and multi-select choices
radio-group     exclusive choices
dialog          modal workflows
dropdown-menu   action menus
popover         anchored small panels
tooltip         extra context, not required information
tabs            related views
table           simple table styling
form            form field composition
toast/sonner    transient feedback
sheet/drawer    side panels
command         command palette or searchable menu
```

Do not add all components at once. Add the component when a screen needs it.

## 14. Accessibility Checklist

```text
Icon-only buttons have aria-label.
Dialogs have a title and useful description.
Keyboard can open, navigate, submit, cancel, and close workflows.
Focus is visible and restored after closing overlays.
Form errors are associated with fields.
Required fields are clear.
Disabled controls explain why when needed.
Tooltip content is not the only way to understand the UI.
Color is not the only signal for status or error.
```

Primitive libraries handle many details, but your labels, copy, validation, and product rules still matter.

## 15. Production Checklist

```text
components.json aliases match tsconfig/jsconfig.
Generated components are committed and reviewed.
Theme tokens match product design.
Dark mode works if enabled.
No component imports server-only modules from a client file.
No secrets are embedded in client-side code.
Forms validate on the server.
Authorization is enforced on the server.
Keyboard and focus behavior are tested for dialogs, menus, popovers, and forms.
Local component changes are documented enough for future updates.
```

## 16. Commands To Remember

```sh
# Initialize shadcn/ui: writes files and changes dependencies
npx shadcn@latest init

# Add one component: writes files and may install dependencies
npx shadcn@latest add button

# Add several components
npx shadcn@latest add dialog dropdown-menu input form

# Add from a registry URL
npx shadcn@latest add https://ui.shadcn.com/r/styles/new-york/button.json

# Inspect local changes before/after
git status --short
git diff
```

## 17. Common Mistakes

### Thinking It Updates Like MUI

shadcn/ui copies code into your app. New package versions do not automatically rewrite your local components.

### Adding Components Without Reading Them

Read generated code. You are responsible for it after it lands in your repository.

### Breaking Accessibility While Styling

Do not remove labels, focus rings, ARIA relationships, keyboard handlers, or primitive wrappers casually.

### Overusing Variants

Variants should reflect product decisions. If every screen needs a new variant, the design system is not stable yet.

### Mixing Setup Guides

Tailwind v3, Tailwind v4, old `shadcn-ui` CLI, and current `shadcn` CLI examples are easy to confuse. Prefer current official docs and match the installed project versions.

## Resources

- shadcn/ui docs: https://ui.shadcn.com/docs
- Installation: https://ui.shadcn.com/docs/installation
- CLI: https://ui.shadcn.com/docs/cli
- `components.json`: https://ui.shadcn.com/docs/components-json
- Theming: https://ui.shadcn.com/docs/theming
- Tailwind CSS: https://tailwindcss.com/docs
- UI color guide: [color.md](color.md)
- Radix UI: https://www.radix-ui.com/primitives/docs/overview/introduction
- Base UI: https://base-ui.com/react/overview/about
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/

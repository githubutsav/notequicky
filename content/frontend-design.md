# Frontend Design and UI Library Learning Notes

Frontend design is the practical skill of turning product intent into screens that are clear, usable, accessible, responsive, and maintainable.

```text
Product goal
  -> content and user workflow
  -> layout, hierarchy, typography, color, spacing, states
  -> accessible components
  -> implementation with CSS and UI libraries
  -> testing, review, and iteration
```

Learn design foundations before collecting libraries. A component library can make a good interface faster, but it cannot decide the information hierarchy, empty states, loading states, keyboard behavior, or the right density for your product.

Read [react.md](react.md) before this note. Read [color.md](color.md) for palette, contrast, dark mode, and theme-token guidance. Read [tailwind.md](tailwind.md) for Tailwind-specific styling notes and [shadcn.md](shadcn.md) for shadcn/ui component workflow. Read [ui-patterns.md](ui-patterns.md) when turning foundations into real product screens. Read [state-management.md](state-management.md) when UI state starts spreading across components. Read [nextjs.md](nextjs.md) when the design crosses server/client, routing, metadata, images, and deployment boundaries.

## 1. What Good Frontend Design Optimizes For

Good UI is not decoration. It helps a user understand what is happening and what to do next.

```text
Clarity       The screen has an obvious job.
Hierarchy    Important things look important.
Density      Information fits the task without feeling cramped.
Feedback     Loading, success, error, disabled, and empty states are visible.
Consistency  Similar actions and data use similar patterns.
Access       Keyboard, screen reader, contrast, touch, and motion needs are handled.
Speed        The interface feels responsive and avoids unnecessary client work.
Maintenance  Components, tokens, and styles can evolve without chaos.
```

Before choosing a library, answer:

```text
Who uses this screen?
What are they trying to finish?
What information must they compare?
What action is most important?
What can go wrong?
What should be visible on a small screen?
What state belongs in the URL, server, form, or component?
```

## 2. Foundations Before Libraries

### Layout

Use semantic HTML first, then CSS layout.

```text
Normal flow       documents, prose, simple forms
Flexbox           one-dimensional alignment: nav bars, button rows, toolbars
Grid              two-dimensional layout: pages, galleries, dashboards
Container queries component layout based on available space
Positioning       overlays, sticky headers, badges, anchored UI
```

Avoid absolute positioning for normal page layout. It often breaks as soon as content length, localization, zoom, or viewport size changes.

### Responsive Design

Responsive design means the layout adapts to available space, not just to device names.

```css
.shell {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr);
}

@media (width >= 64rem) {
  .shell {
    grid-template-columns: 16rem minmax(0, 1fr);
  }
}
```

Use fluid containers and content-based breakpoints. Check long labels, empty data, many rows, zoomed text, and narrow screens.

### Typography

Typography is interface structure.

```text
Body text       16px is a safe default.
Line height     about 1.4-1.7 for prose; tighter for dense UI.
Headings        show hierarchy, not just size.
Labels          short, close to their controls, and easy to scan.
Numbers         align and format consistently in dashboards.
```

Do not use huge headings inside dense dashboards, cards, tables, or sidebars. Match type size to the container.

### Spacing

Use a small spacing scale instead of random values.

```text
4px   tiny icon/text gap
8px   compact control gap
12px  form label/control rhythm
16px  normal group spacing
24px  section spacing
32px  large section spacing
```

Related things should be closer together than unrelated things. If a screen feels messy, fix spacing and alignment before adding colors.

### Color

Use color to encode meaning, not just mood.

```text
Neutral colors     text, borders, surfaces, dividers
Brand color        primary action and selected state
Semantic colors    success, warning, danger, info
Data colors        charts, maps, categories
```

Never rely on color alone. Pair color with text, icons, position, or shape.

For a deeper UI color guide, including contrast, semantic colors, data colors, dark mode, Tailwind tokens, and shadcn/ui tokens, see [color.md](color.md).

```css
:root {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-muted: #6b7280;
  --color-border: #d1d5db;
  --color-primary: #2563eb;
  --space-2: 0.5rem;
  --space-4: 1rem;
}
```

### Accessibility

Accessibility is part of the component contract.

```text
Use real buttons for actions.
Use links for navigation.
Associate labels with inputs.
Keep visible focus styles.
Support keyboard interaction.
Respect reduced motion.
Keep text contrast readable.
Do not hide errors only in color.
Test with zoom and keyboard navigation.
```

Accessible primitives help, but you still own labels, descriptions, error messages, focus order, contrast, and product-specific behavior.

### Design Tokens

Design tokens are named decisions.

```text
--color-primary
--color-danger
--radius-control
--space-3
--font-body
--shadow-popover
```

Use tokens for values that should stay consistent across the app. Do not tokenize every one-off value too early.

### Figma-to-Code Workflow

Use Figma as a source of decisions, not a pixel prison.

```text
Identify components, variants, spacing, states, and responsive behavior.
Map Figma colors and type styles to tokens.
Confirm interactive states that are not visible in the static frame.
Ask about empty, loading, error, permission, and long-content states.
Build semantic markup first.
Compare at common breakpoints and browser zoom.
```

## 3. Styling Tools

Styling choices are tradeoffs between speed, control, runtime cost, team familiarity, and design-system maturity.

| Tool | Solves | Use When | Avoid When | Production Fit | Install |
| --- | --- | --- | --- | --- | --- |
| Plain CSS | Browser-native styling | You need fundamentals, global styles, simple components | You need scoped class names at scale | Always useful | none |
| CSS Modules | Scoped component styles | You want CSS files without class collisions | You need shared variants across many components | Strong default | framework-supported |
| Tailwind CSS | Utility-first styling; see [tailwind.md](tailwind.md) | You want fast iteration and consistent tokens in markup | The team dislikes utility classes or has a heavy existing CSS system | Very popular for SaaS and Next.js apps | `npm install tailwindcss @tailwindcss/vite` for Vite |
| Sass | CSS with variables, nesting, mixins | You maintain an existing Sass codebase | Native CSS or Tailwind already covers the need | Mature, but less essential than before | `npm install -D sass` |
| vanilla-extract | Type-safe CSS-in-TS with static CSS output | You want typed tokens and zero runtime CSS-in-JS | You need the simplest setup | Strong for design systems | `npm install @vanilla-extract/css` plus bundler plugin |
| Emotion / styled-components | Runtime CSS-in-JS | You need component-scoped dynamic styling or use a library built on it | Server rendering/runtime cost is a concern | Common in existing apps | `npm install @emotion/react @emotion/styled` |
| `clsx` | Conditional class strings | Class names depend on props/state | You only concatenate one string | Tiny utility | `npm install clsx` |
| `tailwind-merge` | Resolve conflicting Tailwind classes | Components accept class overrides | You are not using Tailwind | Common with Tailwind component APIs | `npm install tailwind-merge` |
| `class-variance-authority` | Typed class variants | Buttons, badges, alerts need size/tone variants | One-off components | Common with shadcn-style systems | `npm install class-variance-authority` |

Minimal CSS Modules example:

```tsx
import styles from "./Button.module.css";

type ButtonProps = {
  children: React.ReactNode;
};

export function Button({ children }: ButtonProps) {
  return <button className={styles.button}>{children}</button>;
}
```

```css
.button {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}
```

Minimal Tailwind example:

```tsx
export function SaveButton() {
  return (
    <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
      Save
    </button>
  );
}
```

Minimal variant utility:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const button = cva("rounded-md px-3 py-2 text-sm font-medium", {
  variants: {
    tone: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      subtle: "border border-gray-300 bg-white text-gray-900",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, tone, ...props }: ButtonProps) {
  return <button className={twMerge(clsx(button({ tone }), className))} {...props} />;
}
```

## 4. Headless UI and Accessibility Primitives

Headless libraries provide behavior and accessibility for hard UI patterns while leaving styling mostly to you.

| Library | Solves | Use When | Avoid When | Production Fit | Install |
| --- | --- | --- | --- | --- | --- |
| Radix UI | Accessible primitives for dialogs, popovers, dropdowns, tooltips, tabs, and more | You want strong React primitives and custom styling | You want predesigned components | Excellent base for custom systems | `npm install radix-ui` or individual packages |
| Base UI | Unstyled accessible React components | You want modern primitives from the MUI/Radix/Floating UI lineage | You need a fully styled library today | Promising for custom systems | `npm install @base-ui/react` |
| React Aria | Accessible components and hooks with internationalization focus | Accessibility-heavy apps or design systems | You want the shortest learning curve | Very strong for serious accessibility | `npm install react-aria-components` |
| Headless UI | Unstyled accessible components designed around Tailwind workflows | You use Tailwind and need common primitives | You need a very broad primitive catalog | Mature and simple | `npm install @headlessui/react` |
| Ark UI | Headless components across React, Solid, Vue, and Svelte | You want cross-framework design-system primitives | You only need a tiny React app | Good for multi-framework teams | `npm install @ark-ui/react` |
| Ariakit | Lower-level accessible React components and hooks | You want fine control over behavior | You want prebuilt visual design | Strong for custom accessible UI | `npm install @ariakit/react` |

Radix Popover shape:

```tsx
import { Popover } from "radix-ui";

export function HelpPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger>Help</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8}>
          Save changes before leaving the page.
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

React Aria Components shape:

```tsx
import { Button, Dialog, DialogTrigger, Heading, Modal } from "react-aria-components";

export function ConfirmDialog() {
  return (
    <DialogTrigger>
      <Button>Delete</Button>
      <Modal>
        <Dialog>
          <Heading slot="title">Delete item?</Heading>
          <p>This action cannot be undone.</p>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
```

## 5. Component Libraries

Component libraries provide ready-made visual components. They are fastest when your product can accept their design language.

| Library | Solves | Use When | Avoid When | Production Fit | Install |
| --- | --- | --- | --- | --- | --- |
| shadcn/ui | Copyable component patterns built around Tailwind, primitives, and local ownership; see [shadcn.md](shadcn.md) | You want editable components in your repo | You expect normal package-style black-box components | Very popular for modern SaaS | `npx shadcn@latest init` |
| MUI | Complete Material Design React system | Enterprise apps, admin panels, data-heavy products | You need a highly custom non-Material brand with minimal overrides | Very mature | `npm install @mui/material @emotion/react @emotion/styled` |
| Ant Design | Enterprise React component system | Dense business software, tables, forms, internal tools | You need a lightweight bespoke marketing UI | Very mature for enterprise | `npm install antd --save` |
| Mantine | Broad React component and hooks library | You want many components with good DX and theming | You need strict adherence to another design language | Strong app-building library | `npm install @mantine/core @mantine/hooks` |
| Chakra UI | Accessible component primitives with style props | You like style props and theming | You want zero runtime styling | Common and approachable | `npm i @chakra-ui/react @emotion/react` |
| HeroUI / NextUI | Styled React components built on Tailwind and React Aria | You want polished accessible defaults | Your app cannot adopt its styling stack | Production-ready but check version requirements | `npx heroui-cli@latest` or `npm install @heroui/react @heroui/styles` |
| DaisyUI | Tailwind component class names and themes | You want quick prototypes or simple Tailwind themes | You need deep React behavior or custom accessibility primitives | Useful for speed | `npm i -D daisyui@latest` |
| Flowbite React | Tailwind-based React components | You want ready Tailwind components and blocks | You already have a custom design system | Good for fast product UI | `npx flowbite-react@latest init` |
| Bootstrap / React Bootstrap | Classic responsive component system | You maintain Bootstrap apps or need familiar defaults | You want a modern custom UI language | Stable and widely known | `npm install react-bootstrap bootstrap` |
| Fluent UI | Microsoft-style enterprise components | Microsoft ecosystem, Teams-like or Office-like apps | You do not want Fluent design language | Strong for enterprise | `npm install @fluentui/react-components` |

MUI minimal example:

```tsx
import Button from "@mui/material/Button";

export function PrimaryAction() {
  return <Button variant="contained">Save changes</Button>;
}
```

Ant Design minimal example:

```tsx
import { Button, DatePicker } from "antd";

export function ScheduleForm() {
  return (
    <>
      <DatePicker />
      <Button type="primary">Schedule</Button>
    </>
  );
}
```

shadcn/ui mental model:

```text
CLI adds component source into your app.
You own the component code after installation.
Radix, Base UI, or another primitive layer handles hard interaction behavior.
Tailwind handles styling.
```

## 6. Icons

Icons should clarify actions, not replace unclear labels. Use `aria-hidden` for decorative icons and accessible labels for icon-only buttons.

| Library | Best For | Install |
| --- | --- | --- |
| `lucide-react` | General app icons, clean stroke style, great default for SaaS | `npm install lucide-react` |
| Heroicons | Tailwind ecosystem, solid/outline icons | `npm install @heroicons/react` |
| Tabler Icons | Large consistent line-icon set | `npm install @tabler/icons-react` |
| Phosphor Icons | Multiple weights and flexible visual tone | `npm i @phosphor-icons/react` |
| React Icons | Many icon packs through one package | `npm install react-icons --save` |

```tsx
import { Save } from "lucide-react";

export function SaveIconButton() {
  return (
    <button type="button" aria-label="Save">
      <Save aria-hidden="true" size={18} />
    </button>
  );
}
```

Prefer one icon family per product. Mixing icon sets casually makes the UI feel uneven.

## 7. Animation

Animation should explain change. It should not delay the user.

| Library | Solves | Use When | Avoid When | Install |
| --- | --- | --- | --- | --- |
| Motion | React animation, gestures, layout animation | Product UI transitions and microinteractions | A simple CSS transition is enough | `npm install motion` |
| GSAP | Timelines and complex animation control | Rich marketing pages, advanced sequences, SVG/canvas animation | Normal app UI needs small transitions | `npm install gsap` and optionally `npm install @gsap/react` |
| React Spring | Spring physics and data-driven motion | Gesture-like or physics-like UI | You need simple enter/exit transitions only | `npm install @react-spring/web` |
| AutoAnimate | Zero-config list and layout transitions | Lists where items are added, removed, or sorted | You need precise timeline control | `npm install @formkit/auto-animate` |
| Lottie / dotLottie | Designer-exported animations | Brand illustrations and empty states | Critical interaction feedback that must be tiny and instant | package varies by player |

Motion example:

```tsx
"use client";

import { motion } from "motion/react";

export function FadeInPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {children}
    </motion.section>
  );
}
```

Reduced motion guard:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8. Tables, Charts, and Dashboards

Dashboards should prioritize scanning, comparison, filtering, exporting, and error recovery.

### Tables and Data Grids

| Tool | Solves | Use When | Avoid When | Install |
| --- | --- | --- | --- | --- |
| TanStack Table | Headless table state: sorting, filtering, pagination, selection | You want custom markup and behavior | You want a complete styled grid | `npm install @tanstack/react-table` |
| AG Grid | Full-featured data grid | Enterprise grids with grouping, editing, virtualization, Excel-like features | You need a simple table | `npm install ag-grid-react` |
| MUI X Data Grid | Data grid integrated with MUI | Your app already uses MUI | You are not using MUI and want headless control | `npm install @mui/x-data-grid` |

TanStack Table owns table logic; you still render accessible markup.

```tsx
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

type User = {
  name: string;
  email: string;
};

const columns: Array<ColumnDef<User>> = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

export function UserTable({ data }: { data: User[] }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Charts

| Library | Best For | Use When | Avoid When | Install |
| --- | --- | --- | --- | --- |
| Recharts | Common React charts | Product dashboards and simple analytics | You need custom statistical graphics | `npm install recharts` |
| ECharts | Many chart types and large data options | Dense analytics, complex interactions, maps | You need tiny bundle size | `npm install echarts echarts-for-react` |
| Chart.js | Canvas charts | Simple, responsive charts outside heavy React composition | You need SVG-level custom composition | `npm install chart.js` |
| D3 | Low-level visualization primitives | Custom visualizations and data transforms | You just need a normal bar chart | `npm install d3` |
| Nivo | Polished React chart components built on D3 | You want attractive charts quickly | Bundle size or exact custom behavior matters most | `npm install @nivo/core @nivo/bar` |
| visx | Low-level React visualization components | You want D3 power with React rendering | You want out-of-box dashboards | `npm install @visx/scale @visx/shape @visx/group` |

Recharts example:

```tsx
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", signups: 42 },
  { month: "Feb", signups: 57 },
];

export function SignupsChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="signups" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

Chart cautions:

```text
Label axes and units.
Start bars at zero unless there is a strong reason.
Do not use pie charts for precise comparison.
Use colorblind-safe palettes.
Show loading, empty, and error states.
For financial or operational data, define timezone and rounding rules.
```

## 9. Drag, Drop, Resize, and Uploads

Drag and drop must still work for keyboard and touch users where the workflow requires it.

| Library | Solves | Use When | Avoid When | Install |
| --- | --- | --- | --- | --- |
| `dnd-kit` | Accessible drag/drop primitives for React | Sortable lists, boards, custom DnD | You need native file drops only | `npm install @dnd-kit/core` |
| Pragmatic Drag and Drop | Fast low-level drag/drop from Atlassian | Complex DnD across frameworks or performance-sensitive UI | You want high-level React components | `npm install @atlaskit/pragmatic-drag-and-drop` |
| React DnD | Drag/drop architecture with pluggable backends | Legacy or complex DnD apps | You want modern sortable-list ergonomics | `npm install react-dnd react-dnd-html5-backend` |
| `react-dropzone` | File drop zones | File selection and drag-to-upload | You need general component reordering | `npm install react-dropzone` |
| React Rnd | Resizable and draggable boxes | Internal tools, editors, panels | A normal responsive layout is enough | `npm install react-rnd` |

File drop example:

```tsx
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function UploadDropzone() {
  const onDrop = useCallback((files: File[]) => {
    for (const file of files) {
      console.log(file.name);
    }
  }, []);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 3,
    onDrop,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? "Drop files here" : "Choose files"}
    </div>
  );
}
```

Uploads are security-sensitive. Validate file type, size, dimensions, and authorization on the server. Client checks improve UX but do not protect the backend.

## 10. Production Stack Recommendations

Use these as starting points, not rules.

### Modern SaaS

```text
Next.js or Vite React
Tailwind CSS
shadcn/ui
Radix UI or Base UI
lucide-react
Motion
React Hook Form + Zod
TanStack Query
TanStack Table
Recharts
Storybook
Playwright
```

Best when you want high control, modern styling, and components your team can own.

### Enterprise Dashboard

```text
Next.js or Vite React
MUI or Ant Design
TanStack Table, AG Grid, or MUI X Data Grid
ECharts or Recharts
React Hook Form + Zod
Storybook
Playwright
axe-core checks
```

Best when the product needs dense forms, tables, filters, permissions, bulk actions, and predictable admin UI.

### Accessibility-Heavy App

```text
Semantic HTML
React Aria or Radix UI
Plain CSS, CSS Modules, or Tailwind CSS
Testing Library
Playwright keyboard flows
axe-core
Manual screen reader checks
```

Best when forms, dialogs, focus, keyboard interaction, and assistive technology support are central to the product.

### Fast Prototype

```text
Vite React
Tailwind CSS
daisyUI, Flowbite React, Mantine, or HeroUI
lucide-react
Recharts
```

Best when the goal is learning, validation, or an internal proof of concept.

## 11. When To Use What

Pick libraries from the problem, not from popularity. The strongest frontend engineers can explain why a tool fits the product, team, accessibility needs, customization needs, and maintenance cost.

### Fast Decision Map

```text
Custom SaaS/product UI       Tailwind + shadcn/ui + Radix/Base UI
Enterprise dashboard         MUI or Ant Design + AG Grid/MUI X/ECharts
Accessibility-heavy app      Semantic HTML + React Aria/Radix + axe + Playwright
Fast prototype               Mantine, HeroUI, Flowbite, daisyUI, or shadcn/ui
Long-lived design system     Tokens + Radix/Base UI/React Aria + Storybook
Marketing/creative site      Tailwind/CSS Modules + Motion or GSAP
Content-heavy site           Plain CSS/CSS Modules + strong typography + simple components
Data-heavy internal tool     Ant Design/MUI + AG Grid/TanStack Table + ECharts
Small learning app           CSS Modules or Tailwind + a few hand-built components
```

### By Project Type

| Project | Best Starting Stack | Why | Be Careful With |
| --- | --- | --- | --- |
| Modern SaaS | Tailwind CSS, shadcn/ui, Radix UI or Base UI, lucide-react, Motion | High control, modern defaults, local component ownership | Too many copied components without product-level cleanup |
| Enterprise admin | MUI or Ant Design, MUI X Data Grid or AG Grid, ECharts | Dense forms, tables, filters, permissions, and predictable patterns | Fighting the library's design language for a custom brand |
| Accessibility-heavy app | Semantic HTML, React Aria, Radix UI, Testing Library, axe-core, Playwright | Strong keyboard, focus, ARIA, and screen-reader foundations | Assuming primitives solve labels, copy, validation, and flow |
| Fast prototype | Mantine, HeroUI, Flowbite React, daisyUI, or shadcn/ui | Quick screens with usable defaults | Letting prototype shortcuts become permanent architecture |
| Custom design system | Design tokens, CSS Modules/Tailwind/vanilla-extract, Radix/Base UI/React Aria, Storybook | Reusable primitives and documented component states | Building a design system before the product has stable patterns |
| Marketing page | Tailwind or CSS Modules, Motion, GSAP for complex sequences | Visual control and animation flexibility | Heavy app component libraries and slow decorative animation |
| Dashboard with charts | MUI/Ant/shadcn, TanStack Table/AG Grid, Recharts/ECharts | Tables and charts are core workflows, not decoration | Charts without labels, units, empty states, or colorblind support |

### Styling Choice

| Use This | When To Use It | When Not To Use It |
| --- | --- | --- |
| Plain CSS | Learning CSS, content sites, simple global styling, browser-native control | Large apps where class collisions become painful |
| CSS Modules | Scoped component CSS, Next.js apps, teams that prefer normal CSS files | You need a utility workflow or shared variant system everywhere |
| Tailwind CSS | Custom product UI, fast iteration, consistent spacing/color/type scale, shadcn/ui | A team strongly dislikes utility classes or already has a mature CSS system |
| Sass | Existing Sass codebase, nested legacy styles, mature older teams | New app where CSS variables, modules, or Tailwind are enough |
| vanilla-extract | Type-safe tokens, design-system packages, zero-runtime CSS-in-TS | Simple apps where setup cost is not worth it |
| Emotion/styled-components | Existing CSS-in-JS app, MUI customization, highly dynamic component styling | Server-rendered apps where runtime styling cost or compatibility is a concern |
| `clsx` + `tailwind-merge` | Any React app with conditional Tailwind classes | Tiny components with no conditional classes |
| `class-variance-authority` | Buttons, badges, alerts, inputs, and components with stable variants | One-off UI where variants are not reused |

### UI Primitives and Component Kits

| Use This | Best For | Choose It When | Avoid It When |
| --- | --- | --- | --- |
| shadcn/ui | Modern custom SaaS/product UI | You want editable component source in your repo and Tailwind is acceptable | You want automatic package-style updates |
| Radix UI | Accessible low-level primitives | You need dialogs, dropdowns, popovers, tabs, tooltips, and custom styling | You want predesigned visual components |
| Base UI | Unstyled accessible primitives | You want modern primitive APIs and full styling control | Your team needs a large ready-made visual kit today |
| React Aria | Accessibility-heavy custom components | Keyboard, focus, ARIA, internationalization, and complex widgets matter deeply | You want the shortest setup and simplest examples |
| Headless UI | Tailwind-friendly common primitives | You want simple unstyled components with Tailwind ergonomics | You need the broadest primitive catalog |
| MUI | Enterprise apps and dashboards | Material-like defaults, many components, theming, and MUI X are useful | You need a highly custom brand with minimal override work |
| Ant Design | Admin panels and internal tools | Dense business UI, tables, forms, and predictable enterprise patterns matter | You are building a lightweight consumer or marketing UI |
| Mantine | Fast full-featured React apps | You want many components and hooks with good developer experience | Your org already committed to another design language |
| Chakra UI | Accessible style-prop workflow | Your team likes style props and fast component composition | You want zero-runtime styling or Tailwind-first components |
| HeroUI / Flowbite / daisyUI | Polished prototypes and Tailwind shortcuts | Speed matters more than deep design-system ownership | You need strict custom behavior across a large product |
| Fluent UI | Microsoft ecosystem apps | The product should feel native to Microsoft/Office/Teams-style workflows | Your product has a different visual language |

### Icons

```text
Default app icons              lucide-react
Tailwind ecosystem             Heroicons
Large line-icon catalog        Tabler Icons
Multiple weights/styles        Phosphor Icons
Many icon packs in one place   React Icons
```

Use icon-only buttons only when the icon is truly recognizable and the button has an accessible label. Otherwise, use icon plus text.

### Animation

| Use This | When To Use It | When Not To Use It |
| --- | --- | --- |
| CSS transitions | Hover, focus, simple show/hide, small state changes | Complex choreography or gesture-driven UI |
| Motion | React UI animation, layout animation, gestures, polished product transitions | Simple color/opacity changes that CSS can handle |
| GSAP | Timeline-heavy marketing pages, scroll sequences, SVG/canvas animation | Normal dashboards and forms |
| React Spring | Physics-like interaction and gesture feel | Straightforward enter/exit UI |
| AutoAnimate | Quick list add/remove/reorder transitions | You need exact timeline control |
| Lottie | Designer-exported illustrations and empty states | Core product feedback that should be lightweight and instant |

Default rule: use CSS first, Motion second, GSAP only when the animation itself is a major feature.

### Tables and Data Grids

```text
Simple static table                  semantic table + CSS/Tailwind
Custom React table logic             TanStack Table
Enterprise grid with heavy features  AG Grid
MUI app needing a grid               MUI X Data Grid
Ant Design admin table               Ant Design Table
Huge lists without table semantics   TanStack Virtual or react-virtuoso
```

Choose TanStack Table when you want control over markup and styling. Choose AG Grid when users expect spreadsheet-like power: grouping, pinned columns, editing, export, virtualization, and complex filtering.

### Charts and Data Visualization

```text
Normal dashboard charts       Recharts
Complex dashboard visuals     ECharts
Simple canvas charts          Chart.js
Polished React chart kit      Nivo
Custom visualization          D3 or visx
Maps                          Mapbox GL or MapLibre
3D                            Three.js or React Three Fiber
```

Use Recharts first for typical React dashboards. Use ECharts when the chart is more complex than the rest of the page. Use D3 or visx when you are designing a custom visualization, not just rendering a chart.

### Forms and Validation

```text
Simple form                  native form + controlled/uncontrolled inputs
Production React forms       React Hook Form
Schema validation            Zod or Valibot
Existing legacy app          Formik/Yup maintenance
Next.js server mutation      native form + Server Function + server validation
```

React Hook Form is usually the best default for complex client forms. Keep validation close to the boundary: client validation for UX, server validation for trust.

### Drag, Drop, Resize, and Uploads

```text
Sortable React lists/boards       dnd-kit
Complex cross-framework DnD       Pragmatic Drag and Drop
Legacy/advanced DnD architecture  React DnD
File drop zones                   react-dropzone
Resizable/draggable panels        React Rnd
```

Do not make drag and drop the only way to complete an important workflow. Provide buttons, menus, or keyboard paths when the action matters.

### Testing and Documentation

```text
Component behavior             Testing Library
Unit tests                     Vitest
End-to-end user journeys       Playwright
API mocking                    MSW
Accessibility checks           axe-core or jest-axe
Component examples/docs        Storybook
Visual regression              Storybook/Chromatic or Playwright screenshots
```

Use Storybook when components have meaningful variants, states, and stakeholders. Use Playwright for flows users actually depend on: signup, checkout, dashboard filters, auth redirects, uploads, and destructive actions.

For a deeper frontend testing workflow, see [frontend-testing.md](frontend-testing.md).

### Observability and Product Feedback

```text
Frontend error tracking       Sentry
Session replay/debugging      LogRocket or Sentry Replay
Product analytics             PostHog
Performance metrics           browser APIs, framework analytics, Sentry
Feature flags/experiments     PostHog or dedicated flag tools
```

Use these after the app has real users or real QA workflows. Do not record secrets, tokens, passwords, private messages, or sensitive form fields.

### Default Choices If You Are Unsure

```text
Styling                 Tailwind CSS or CSS Modules
Component strategy      shadcn/ui for custom SaaS, MUI for enterprise
Primitives              Radix UI first, React Aria for accessibility-heavy UI
Icons                   lucide-react
Forms                   React Hook Form + Zod
Tables                  TanStack Table, AG Grid for enterprise
Charts                  Recharts, ECharts for complexity
Animation               CSS first, Motion for React transitions
Drag/drop               dnd-kit
Testing                 Vitest + Testing Library + Playwright
Docs                    Storybook when components repeat
```

## 12. Production UI Checklist

```text
Layout works at mobile, tablet, desktop, and browser zoom.
Text does not overflow buttons, cards, nav, tables, or modals.
Keyboard navigation reaches every interactive element.
Focus is visible and logical.
Dialogs trap focus and restore focus on close.
Forms have labels, errors, disabled states, and pending states.
Loading, empty, error, and permission states are designed.
Color contrast is checked.
Motion respects prefers-reduced-motion.
Images have useful alt text or are marked decorative.
Icon-only buttons have aria-label.
Tables have headers, sorting labels, pagination, and empty states.
Charts have labels, units, accessible summaries, and non-color cues.
Client validation is repeated on the server.
Component APIs do not expose unsafe class or HTML escape hatches casually.
Storybook or examples cover key variants and edge states.
Playwright covers critical user journeys.
```

## 13. Learning Path

1. HTML semantics and forms.
2. CSS fundamentals, selectors, cascade, box model, flexbox, grid, responsive design.
3. Typography, spacing, color, contrast, and design tokens.
4. React component composition and props.
5. Tailwind CSS or CSS Modules.
6. `clsx`, `tailwind-merge`, and `class-variance-authority`.
7. `lucide-react`.
8. Radix UI or React Aria.
9. shadcn/ui if using Tailwind.
10. React Hook Form + Zod for real forms.
11. TanStack Table for custom tables.
12. Recharts for dashboards.
13. Storybook for component examples.
14. Playwright for user-flow testing.
15. MUI and Ant Design for enterprise patterns.

## 14. Practice Projects

1. Build a settings page with tabs, forms, validation, loading, save success, and field errors.
2. Build a billing table with sorting, filtering, pagination, empty state, and row actions.
3. Build a dashboard with KPI cards, one chart, one table, and a date-range filter.
4. Build a command menu, dialog, dropdown, tooltip, and popover with keyboard testing.

For reusable product screen recipes, see [ui-patterns.md](ui-patterns.md).
5. Build a kanban board with drag sorting and a non-drag fallback action.
6. Recreate one Figma screen with semantic HTML, responsive layout, and tokenized styles.

## 15. Common Mistakes

### Starting With a Library Before the UI Problem

Do not choose MUI, shadcn/ui, Tailwind, or Radix before you understand the workflow, density, states, and constraints. Tools should follow the product shape.

### Styling Clickable `div`s

Use real controls. Buttons and links include keyboard and accessibility behavior that generic elements do not.

### Treating Client Validation as Security

Client validation helps users. Server validation protects the app.

### Overusing Cards

Cards are useful for repeated items and grouped controls. Entire pages made of nested cards often become harder to scan.

### Hiding State

Every async interaction needs pending, success, failure, retry, and disabled behavior where applicable.

### Copying Enterprise UI Into Small Apps

Enterprise libraries are powerful, but their density and design language can overwhelm a small consumer app.

### Copying Marketing UI Into Tools

Operational tools need scanability, compact controls, predictable navigation, and low-friction repeated actions.

## 16. Commands To Remember

```sh
# Tailwind with Vite: changes dependencies
npm install tailwindcss @tailwindcss/vite

# shadcn/ui setup: writes files and changes dependencies
npx shadcn@latest init

# Radix primitives: changes dependencies
npm install radix-ui

# React Aria Components: changes dependencies
npm install react-aria-components

# MUI: changes dependencies
npm install @mui/material @emotion/react @emotion/styled

# Ant Design: changes dependencies
npm install antd --save

# Mantine: changes dependencies
npm install @mantine/core @mantine/hooks

# Motion: changes dependencies
npm install motion

# Tables: changes dependencies
npm install @tanstack/react-table

# Charts: changes dependencies
npm install recharts

# Storybook: writes files and changes dependencies
npm create storybook@latest
```

## Resources

- MDN Flexbox: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox
- MDN Responsive Design: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design
- MDN CSS custom properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
- Tailwind CSS: https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui: https://ui.shadcn.com/docs/installation
- Radix UI: https://www.radix-ui.com/primitives/docs/overview/introduction
- Base UI: https://base-ui.com/react/overview/about
- React Aria: https://react-spectrum.adobe.com/react-aria/
- Headless UI: https://headlessui.com/
- Ark UI: https://ark-ui.com/
- Ariakit: https://ariakit.org/
- MUI: https://mui.com/material-ui/getting-started/
- Ant Design: https://ant.design/docs/react/introduce/
- Mantine: https://mantine.dev/getting-started/
- Chakra UI: https://chakra-ui.com/docs/get-started/installation
- HeroUI: https://heroui.com/en/docs/react/getting-started
- Storybook: https://storybook.js.org/docs/get-started/install
- TanStack Table: https://tanstack.com/table/latest/docs/installation
- AG Grid React: https://www.ag-grid.com/react-data-grid/installation/
- Recharts: https://recharts.github.io/en-US/guide/installation/
- D3: https://d3js.org/getting-started
- Motion: https://motion.dev/docs/react-installation
- dnd-kit: https://docs.dndkit.com/
- Pragmatic Drag and Drop: https://atlassian.design/components/pragmatic-drag-and-drop/core-package/
- react-dropzone: https://react-dropzone.js.org/

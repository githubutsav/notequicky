# Color Guide for Frontend UI

Color in UI is a communication system. It creates hierarchy, shows state, supports brand, and helps users scan information.

```text
Color should answer:
What is primary?
What is secondary?
What needs attention?
What changed?
What is safe, risky, disabled, selected, or interactive?
```

Good color work is not about making every screen colorful. It is about using a small set of roles consistently.

Read [frontend-design.md](frontend-design.md) first for broader UI foundations. Read [tailwind.md](tailwind.md) for implementing color tokens in Tailwind and [shadcn.md](shadcn.md) for shadcn/ui theme tokens.

## 1. Color Roles

Start with roles before picking exact values.

```text
Neutral      text, backgrounds, borders, surfaces, dividers
Brand        primary action, selected item, active navigation
Semantic     success, warning, danger, info
Data         charts, maps, status categories, comparison
Overlay      modals, scrims, shadows, focus rings
Disabled     unavailable controls and secondary hints
```

Most interfaces should be mostly neutral. Brand and semantic colors become clearer when they are not everywhere.

## 2. Color Terms

Useful vocabulary:

```text
Hue          the color family: blue, red, green, yellow
Lightness    how light or dark a color is
Chroma       perceptual color intensity in OKLCH
Saturation   color intensity in HSL-style models
Contrast     difference between foreground and background
Alpha        transparency
Temperature  warm colors feel red/yellow; cool colors feel blue/green
```

Modern CSS supports several color formats:

```css
.examples {
  color: #2563eb;
  color: rgb(37 99 235);
  color: hsl(221 83% 53%);
  color: oklch(54.6% 0.245 262.881);
}
```

`OKLCH` is useful for design systems because lightness changes usually feel more consistent to humans than HSL lightness changes. Use normal hex or RGB when the design source already uses them and you do not need a generated scale.

## 3. Accessibility Contrast

Current practical baseline: use WCAG 2.2 for web accessibility conformance unless your organization has a stricter rule.

WCAG 2.2 contrast targets:

```text
Normal text              4.5:1 minimum
Large text               3:1 minimum
Enhanced normal text     7:1 for AAA
Enhanced large text      4.5:1 for AAA
Meaningful non-text UI   3:1 against adjacent colors
```

Large text generally means at least 18pt regular or 14pt bold, which roughly maps to 24px regular or 18.66px bold in CSS pixels.

Non-text UI includes meaningful icons, input borders, focus indicators, selected states, chart marks, and controls. Decorative details do not need contrast, but important visual cues do.

Never rely on color alone:

```text
Error      red + text + icon + field association
Success    green + text
Warning    amber + label
Selected   color + checkmark/border/position
Chart      color + label/legend/pattern/order
```

WCAG 3 and APCA-related contrast work may matter in the future, but WCAG 3 is still a draft. Do not replace WCAG 2.2 checks with draft-only guidance for production conformance.

## 4. Palette Anatomy

A useful app palette usually has:

```text
Neutral scale       10-12 values for text, surfaces, borders
Brand scale         one primary hue with light and dark steps
Semantic scales     success, warning, danger, info
Data palette        distinct chart/category colors
Alpha overlays      focus rings, hover backgrounds, scrims
Dark-mode tokens    not just inverted light colors
```

Keep the first version small:

```text
background
foreground
muted
muted-foreground
border
primary
primary-foreground
success
success-foreground
warning
warning-foreground
danger
danger-foreground
ring
```

## 5. Neutral Colors

Neutrals do most of the work.

```text
Page background         near white or near black
Card background         slightly separated from page
Main text               strongest neutral
Muted text              secondary information
Border                  visible but quiet
Divider                 subtle separation
Input background        usually same as card/page
Disabled background     visibly inactive
```

Example neutral tokens:

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f9fafb;
  --color-panel: #ffffff;
  --color-text: #111827;
  --color-muted: #6b7280;
  --color-border: #d1d5db;
}
```

Avoid low-contrast gray text for important content. Secondary text can be quieter, but it still needs to be readable.

## 6. Brand Color

The brand color should make the primary action and selected state obvious.

Good uses:

```text
Primary button
Active navigation item
Selected tab
Focused control ring
Important link
Key chart highlight
```

Risky uses:

```text
Every heading
Every icon
Large page backgrounds
Long paragraphs
Every border
Both success and primary actions
```

Primary button pair:

```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-foreground: #ffffff;
}
```

Always check the foreground against the exact background. A blue that works with white text may fail with gray text or with transparency over a photo.

## 7. Semantic Colors

Semantic colors communicate product meaning.

```text
Success   completed, paid, healthy, available
Warning   attention, risk, delayed, unsaved, partial
Danger    destructive, failed, overdue, blocked, invalid
Info      neutral notice, help, new feature
```

Do not overload meanings:

```text
If green means success, do not use the same green as the primary brand action in forms where success also appears.
If red means destructive, do not use red for normal marketing decoration inside an admin app.
If yellow means warning, pair it with text because yellow can be low contrast.
```

Example semantic tokens:

```css
:root {
  --color-success: #15803d;
  --color-success-bg: #f0fdf4;
  --color-warning: #b45309;
  --color-warning-bg: #fffbeb;
  --color-danger: #b91c1c;
  --color-danger-bg: #fef2f2;
  --color-info: #0369a1;
  --color-info-bg: #f0f9ff;
}
```

Status badge example:

```tsx
const statusClass = {
  paid: "bg-green-50 text-green-700 ring-green-600/20",
  pending: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
};
```

The label still matters:

```tsx
<span className={statusClass.failed}>Failed</span>
```

## 8. Data Visualization Colors

Data colors should support comparison.

Use:

```text
Sequential scale     low to high values
Diverging scale      below/above a meaningful midpoint
Categorical palette  unrelated categories
Highlight color      one important series among neutral context
```

Avoid:

```text
Too many saturated colors
Red/green as the only distinction
Rainbow palettes for ordered data
Using brand color for every series
Chart colors that conflict with app semantic colors
```

Simple chart palette:

```ts
export const chartColors = {
  primary: "#2563eb",
  secondary: "#14b8a6",
  tertiary: "#f59e0b",
  danger: "#dc2626",
  neutral: "#64748b",
};
```

For charts, add labels, legends, tooltips, and table equivalents where needed. Color helps scanning; it should not be the only way to understand the data.

## 9. Light and Dark Mode

Dark mode is a separate palette, not an automatic inversion.

Light mode:

```css
:root {
  --background: #ffffff;
  --foreground: #111827;
  --surface: #f9fafb;
  --border: #d1d5db;
  --primary: #2563eb;
}
```

Dark mode:

```css
.dark {
  --background: #09090b;
  --foreground: #f9fafb;
  --surface: #18181b;
  --border: #3f3f46;
  --primary: #60a5fa;
}
```

Dark-mode cautions:

```text
Pure white text on pure black can feel harsh for long reading.
Borders usually need to be lighter in dark mode than simple inversion suggests.
Saturated colors can glow on dark backgrounds.
Shadows are less useful; use surface contrast and borders.
Images, charts, and code blocks need separate review.
```

## 10. UI States

Every interactive color needs states.

```text
Default
Hover
Active/pressed
Focus-visible
Selected/current
Disabled
Loading
Error
Success
```

Button example:

```tsx
export function SaveButton() {
  return (
    <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500">
      Save
    </button>
  );
}
```

Do not signal focus with color change alone if it is hard to see. A visible outline or ring is usually clearer.

## 11. CSS Tokens

Use semantic tokens in app code. Keep raw palette values in one place.

```css
:root {
  --color-background: #ffffff;
  --color-foreground: #111827;
  --color-muted: #6b7280;
  --color-border: #d1d5db;
  --color-primary: #2563eb;
  --color-primary-foreground: #ffffff;
  --color-danger: #b91c1c;
  --color-danger-foreground: #ffffff;
}

.button {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
```

Prefer role names over color names in component APIs:

```text
Good:  tone="danger"
Risky: color="red"
Good:  variant="primary"
Risky: color="blue"
```

Color names are fine inside palette files. Product components should usually speak in intent.

## 12. Tailwind Color Tokens

In Tailwind v4, use `@theme` when you want CSS variables to generate utility classes.

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(97% 0.02 255);
  --color-brand-100: oklch(93% 0.04 255);
  --color-brand-600: oklch(54.6% 0.245 262.881);
  --color-brand-700: oklch(48.8% 0.243 264.376);
}
```

Then use:

```tsx
<button className="bg-brand-600 text-white hover:bg-brand-700">
  Save
</button>
```

Use normal CSS variables when you need semantic roles:

```css
:root {
  --app-critical-border: oklch(70% 0.17 25);
}
```

For more Tailwind details, see [tailwind.md](tailwind.md).

## 13. shadcn/ui Color Tokens

Current shadcn/ui theming uses semantic CSS variables by default.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
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

The convention pairs surface and foreground:

```text
background / foreground
card / card-foreground
popover / popover-foreground
primary / primary-foreground
secondary / secondary-foreground
muted / muted-foreground
accent / accent-foreground
destructive / destructive-foreground
```

Adding a custom warning token:

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

Then use:

```tsx
<div className="bg-warning text-warning-foreground">Payment pending</div>
```

For more shadcn/ui details, see [shadcn.md](shadcn.md).

## 14. Choosing a Palette

Practical process:

```text
1. Pick neutral scale first.
2. Pick one primary brand hue.
3. Define primary foreground and hover.
4. Add semantic colors.
5. Add chart colors only when charts exist.
6. Test light mode.
7. Test dark mode separately.
8. Check contrast and color-only meaning.
9. Create tokens.
10. Use tokens in components.
```

Ask these questions:

```text
Does the primary action stand out?
Can users scan headings, labels, body text, and metadata?
Can disabled controls be distinguished from enabled controls?
Are danger actions visually distinct from primary actions?
Do links look interactive?
Can colorblind users understand status and charts?
Does dark mode reduce glare without losing contrast?
```

## 15. Colorblind and Low-Vision Checks

Common issues:

```text
Red and green status dots without labels.
Blue and purple lines in a chart that are too similar.
Low-contrast gray placeholder text.
Thin borders used as the only input boundary.
Color-only required fields.
Error text too close to normal helper text.
Focus ring only visible on one theme.
```

Safer patterns:

```text
Status text next to status color.
Icons plus labels.
Different line styles or markers in charts.
Higher-contrast focus rings.
Clear border and background changes for selected state.
Form errors tied to field text.
```

## 16. Common Mistakes

### Using Too Many Accent Colors

A page with five accent colors often has no hierarchy. Start mostly neutral, then use color where it changes user decisions.

### Making Gray Text Too Light

Muted text still needs to be readable. Do not use low-contrast gray for labels, field values, errors, or legal-critical content.

### Reusing Red for Everything

Red should usually mean danger, destructive action, failure, overdue, or invalid. Casual red decoration makes warnings less clear.

### Designing Only Light Mode

If the product supports dark mode, every token needs a dark value. Do not depend on browser inversion.

### Forgetting Hover and Focus

The default state is not enough. Users need visible feedback before and during interaction.

### Trusting a Palette Screenshot

Colors change with surrounding colors, font size, display quality, opacity, and dark mode. Test in real UI.

## 17. Production Checklist

```text
Normal text meets 4.5:1 contrast.
Large text and meaningful non-text UI meet 3:1 contrast.
Color is not the only way to communicate state.
Primary, danger, warning, success, and info are distinct.
Semantic colors have readable foreground pairs.
Focus rings are visible on light and dark backgrounds.
Disabled states are clear without hiding important information.
Dark mode has reviewed tokens, not automatic inversion.
Charts include labels or legends beyond color.
Design tokens are centralized.
Tailwind/shadcn tokens map to semantic roles.
Screens are checked at browser zoom and on real devices when possible.
```

## 18. Practice Tasks

1. Build a neutral palette for a dashboard with page, card, border, text, and muted text.
2. Add one brand color with readable foreground, hover, and focus ring.
3. Add success, warning, danger, and info badges with text labels.
4. Convert raw colors into CSS variables.
5. Convert the same palette into Tailwind `@theme` variables.
6. Build light and dark mode tokens for a shadcn/ui-style app.
7. Create a chart palette with five categories that still works without relying only on color.

## Resources

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2 Overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- WCAG Contrast Minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- WCAG Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast
- WCAG 3 Introduction: https://w3c.github.io/wai-website/standards-guidelines/wcag/wcag3-intro/
- MDN CSS colors: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value
- MDN OKLCH: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch
- Tailwind theme variables: https://tailwindcss.com/docs/theme
- Tailwind dark mode: https://tailwindcss.com/docs/dark-mode
- shadcn/ui theming: https://ui.shadcn.com/docs/theming

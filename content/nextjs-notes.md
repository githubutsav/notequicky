---
title: Next.js Notes
description: Things I keep forgetting about the App Router, caching, and RSC.
date: 2026-05-14
tags: [dev, nextjs]
---

## Server vs client components

Default to server components. Only add `"use client"` when you need:

- Event handlers (`onClick`, `onChange`)
- Hooks (`useState`, `useEffect`)
- Browser-only APIs

A server component can render client components, but a client component can only receive server components as `children`.

## Static generation

For a fully static page from markdown files:

```tsx
export async function generateStaticParams() {
  const notes = getAllNotes()
  return notes.map((note) => ({ slug: note.slug }))
}
```

## Caching gotchas

- `fetch` is cached by default in server components
- `revalidateTag` now takes a cache profile as a second argument
- Reading files with `fs` at build time is fine for static sites — no cache to worry about

## Metadata

Set per-page metadata with `generateMetadata` when it depends on params:

```tsx
export async function generateMetadata({ params }) {
  const { slug } = await params
  const note = getNote(slug)
  return { title: note.title, description: note.description }
}
```

Remember: `params` is a Promise in Next.js 15+ and must be awaited.

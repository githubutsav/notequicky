---
title: Getting Started
description: How this notes site works and how to add your own markdown files.
date: 2026-07-19
tags: [meta, guide]
---

## Welcome to your notes

This site turns plain markdown files into a fast, searchable static website. Every note lives in the `content/` folder at the root of the project.

## Adding a note

Create a new `.md` file in `content/` with frontmatter at the top:

```md
---
title: My New Note
description: A short summary shown in lists and search.
date: 2026-07-19
tags: [example, ideas]
---

Your markdown content goes here.
```

The filename becomes the URL. For example, `content/my-new-note.md` is served at `/notes/my-new-note`.

## What's supported

- **Frontmatter** — title, description, date, and tags
- **GitHub-flavored markdown** — tables, task lists, strikethrough
- **Code blocks** with monospace styling
- **Search** — press `⌘K` (or `Ctrl+K`) anywhere
- **Tags** — click any tag to see related notes
- **Table of contents** — generated from your headings automatically

## Task lists work too

- [x] Set up the site
- [x] Write a first note
- [ ] Replace the sample notes with your own

## Tables

| Feature | Where |
| ------- | ----- |
| Search  | `⌘K` from anywhere |
| Tags    | Sidebar and note pages |
| TOC     | Right side of each note |

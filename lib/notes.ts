import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface Heading {
  depth: number
  text: string
  slug: string
}

export interface NoteMeta {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  /** Plain-text excerpt used for search */
  searchText: string
}

export interface Note extends NoteMeta {
  content: string
  headings: Heading[]
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  const lines = markdown.split("\n")
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = /^(#{2,3})\s+(.+)$/.exec(line)
    if (match) {
      const text = match[2].replace(/[*_`]/g, "").trim()
      headings.push({
        depth: match[1].length,
        text,
        slug: slugifyHeading(text),
      })
    }
  }

  return headings
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseNote(fileName: string): Note {
  const slug = fileName.replace(/\.md$/, "")
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8")
  const { data, content } = matter(raw)

  const tags: string[] = Array.isArray(data.tags)
    ? data.tags.map((t: unknown) => String(t))
    : []

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ? new Date(data.date).toISOString() : "",
    tags,
    searchText: toPlainText(content).slice(0, 2000),
    content,
    headings: extractHeadings(content),
  }
}

export function getAllNotes(): Note[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseNote)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getNote(slug: string): Note | undefined {
  return getAllNotes().find((n) => n.slug === slug)
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const note of getAllNotes()) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function getNotesByTag(tag: string): Note[] {
  return getAllNotes().filter((n) => n.tags.includes(tag))
}

export function formatDate(iso: string): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

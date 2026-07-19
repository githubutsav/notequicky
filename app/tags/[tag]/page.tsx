import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { formatDate, getAllTags, getNotesByTag } from "@/lib/notes"

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  return { title: `Tagged: ${decodeURIComponent(tag)}` }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: rawTag } = await params
  const tag = decodeURIComponent(rawTag)
  const notes = getNotesByTag(tag)
  if (notes.length === 0) notFound()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:py-12">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Tag</p>
        <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
          {tag}
          <Badge variant="secondary">{notes.length} notes</Badge>
        </h1>
      </div>

      <ul className="flex flex-col gap-3">
        {notes.map((note) => (
          <li key={note.slug}>
            <Link
              href={`/notes/${note.slug}`}
              className="border-border/60 bg-card hover:border-primary/40 group flex flex-col gap-1.5 rounded-lg border p-4 transition-colors"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="group-hover:text-primary font-medium transition-colors">
                  {note.title}
                </h2>
                {note.date && (
                  <time
                    dateTime={note.date}
                    className="text-muted-foreground text-xs"
                  >
                    {formatDate(note.date)}
                  </time>
                )}
              </div>
              {note.description && (
                <p className="text-muted-foreground text-pretty text-sm leading-relaxed">
                  {note.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

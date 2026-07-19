import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Markdown } from "@/components/markdown"
import { Toc } from "@/components/toc"
import { formatDate, getAllNotes, getNote } from "@/lib/notes"

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const note = getNote(slug)
  if (!note) return {}
  return { title: note.title, description: note.description }
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = getNote(slug)
  if (!note) notFound()

  return (
    <div className="flex gap-8 px-4 py-8 md:py-12">
      <article className="mx-auto min-w-0 max-w-3xl flex-1">
        <header className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {note.title}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {note.date && (
              <time dateTime={note.date}>{formatDate(note.date)}</time>
            )}
            {note.tags.length > 0 && (
              <span className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge
                      variant="secondary"
                      className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </span>
            )}
          </div>
        </header>

        <Separator className="my-6" />

        <Markdown content={note.content} />
      </article>

      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 xl:block">
        <Toc headings={note.headings} />
      </aside>
    </div>
  )
}

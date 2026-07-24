import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Toc } from "@/components/toc"
import { QuickActions } from "@/components/quick-actions"
import { NoteEditor } from "@/components/note-editor"
import { formatDate, getNote, getAdjacentNotes } from "@/lib/notes"
import { getNoteEdit } from "@/app/actions"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { CommentSection } from "@/components/comment-section"

// Dynamic so we can read session + fetch personal DB override per request
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const slugStr = Array.isArray(slug) ? slug.join('/') : slug
  const decoded = decodeURIComponent(slugStr)
  const note = getNote(decoded) || getNote(slugStr)
  if (!note) return {}
  return { title: note.title, description: note.description }
}

export default async function NotePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { edit } = await searchParams
  const slugStr = Array.isArray(slug) ? slug.join('/') : slug
  
  // URL decode the slug string because Next.js catch-all routes sometimes preserve encoding
  const decodedSlugStr = decodeURIComponent(slugStr)

  // Redirect old legacy slug if accessed
  if (decodedSlugStr === "git & github" || decodedSlugStr === "git %26 github" || slugStr === "git%20&%20github") {
    redirect("/notes/git-and-github")
  }

  if (decodedSlugStr === "new") {
    return (
      <div className="flex gap-8 px-4 py-8 md:py-12">
        <article className="mx-auto min-w-0 max-w-3xl flex-1">
          <NoteEditor
            slug="new"
            originalContent={"# Your Note Title\n\n> **Tip:** The title of your note is automatically set from the first heading (`# `).\n\nWrite your markdown here..."}
            defaultIsEditing={true}
          />
        </article>
      </div>
    )
  }

  let note = getNote(decodedSlugStr)
  let userEdit = null
  let isCustomNote = false

  if (!note) {
    const dbNote = await db.note.findUnique({ where: { id: decodedSlugStr } })
    if (!dbNote) notFound()

    note = {
      title: dbNote.title,
      description: "",
      date: dbNote.updatedAt.toISOString(),
      content: dbNote.content,
      slug: dbNote.id,
      headings: [],
      order: 0,
      searchText: "",
    }
    isCustomNote = true
  } else {
    userEdit = await getNoteEdit(decodedSlugStr)
  }

  let noteHighlights: any[] = []
  let comments: any[] = []
  const session = await auth()
  
  if (session?.user?.id) {
    noteHighlights = await db.highlight.findMany({
      where: {
        userId: session.user.id,
        noteSlug: note.slug,
      }
    })
    
    comments = await db.comment.findMany({
      where: {
        noteSlug: note.slug,
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  const { prev, next } = getAdjacentNotes(decodedSlugStr)

  return (
    <div className="flex gap-8 px-4 py-6 md:py-8">
      <article className="mx-auto min-w-0 max-w-3xl flex-1">
        <header className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {note.title}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            {note.date && (
              <time dateTime={note.date}>{formatDate(note.date)}</time>
            )}
          </div>
        </header>

        <Separator className="my-3" />

        {/* NoteEditor handles both viewing and editing */}
        <NoteEditor
          slug={decodedSlugStr}
          originalContent={note.content}
          savedContent={userEdit?.content ?? null}
          defaultIsEditing={edit === 'true'}
          isCustomNote={isCustomNote}
          highlights={noteHighlights}
        />

        {/* Next and Previous Navigation */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-8 pb-10">
          {prev ? (
            <Link
              href={`/notes/${prev.slug.split('/').map(encodeURIComponent).join('/')}`}
              className="group flex w-full sm:w-[48%] flex-col items-start gap-2 rounded-xl border border-border/40 bg-card/40 p-5 shadow-sm backdrop-blur transition-all duration-150 hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-md"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary/70">
                <ChevronLeft className="size-3.5 transition-transform duration-150 group-hover:-translate-x-1.5" />
                Previous Article
              </div>
              <div className="text-base font-medium line-clamp-1">{prev.title}</div>
            </Link>
          ) : (
            <div className="w-full sm:w-[48%]"></div>
          )}

          {next && (
            <Link
              href={`/notes/${next.slug.split('/').map(encodeURIComponent).join('/')}`}
              className="group flex w-full sm:w-[48%] flex-col items-end gap-2 rounded-xl border border-border/40 bg-card/40 p-5 text-right shadow-sm backdrop-blur transition-all duration-150 hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-md"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary/70">
                Next Article
                <ChevronRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-1.5" />
              </div>
              <div className="text-base font-medium line-clamp-1">{next.title}</div>
            </Link>
          )}
        </div>

        {/* Comments */}
        {session?.user && (
          <CommentSection noteSlug={note.slug} comments={comments} />
        )}
      </article>

      <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-56 shrink-0 xl:flex xl:flex-col">
        <div className="flex-1 pr-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Toc headings={note.headings} />
        </div>
        <div className="pr-4">
          <QuickActions prev={prev} next={next} />
        </div>
      </aside>
    </div>
  )
}

import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { FileText, ExternalLink, Clock } from "lucide-react"
import type { Metadata } from "next"
import { DeleteButton } from "@/components/delete-button"

export const metadata: Metadata = { title: "My Notes" }
export const dynamic = "force-dynamic"

export default async function DraftsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const [dbNotes, noteEdits] = await Promise.all([
    // Notes created from scratch with the [+] button
    db.note.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    // Personal edits of existing static notes
    db.noteEdit.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const hasContent = dbNotes.length > 0 || noteEdits.length > 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Notes</h1>
          <p className="text-sm text-muted-foreground">
            {dbNotes.length} created · {noteEdits.length} personal edit{noteEdits.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <FileText className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-lg font-medium">No notes yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click the <span className="font-medium">+</span> button in the header to create a note, or edit any existing note to save your own version.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Created notes */}
          {dbNotes.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Created by me</h2>
              <div className="flex flex-col gap-3">
                {dbNotes.map((note) => (
                  <div
                    key={note.id}
                    data-delete-item
                    className="relative rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/30 hover:bg-accent/20 flex flex-col"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <DeleteButton id={note.id} type="note" />
                    </div>
                    <Link href={`/notes/${note.id}`} className="flex-1 pr-8 block">
                      <h3 className="mb-1 font-semibold hover:underline">{note.title}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {note.content.slice(0, 160)}…
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5">{note.folder}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personal edits of static notes */}
          {noteEdits.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">My personal edits</h2>
              <div className="flex flex-col gap-3">
                {noteEdits.map((edit) => (
                  <div
                    key={edit.id}
                    data-delete-item
                    className="relative flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/30 hover:bg-accent/20"
                  >
                    <Link href={`/notes/${edit.slug}`} className="flex-1 pr-4">
                      <p className="font-medium hover:underline">{edit.slug}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {edit.content.slice(0, 100)}…
                      </p>
                    </Link>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground ml-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(edit.updatedAt).toLocaleDateString()}
                      </div>
                      <DeleteButton slug={edit.slug} type="note-edit" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

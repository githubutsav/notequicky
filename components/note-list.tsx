import Link from "next/link"
import { Folder } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/notes"
import type { DirectoryContents } from "@/lib/notes"

export function NoteList({ contents }: { contents: DirectoryContents }) {
  return (
    <ul className="flex flex-col gap-3">
      {contents.folders.map((folder) => (
        <li key={folder.path}>
          <Link
            href={`/folders/${folder.path}`}
            className="border-border/60 bg-card hover:border-primary/40 group flex flex-col gap-2 rounded-lg border p-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Folder className="text-muted-foreground h-5 w-5" />
              <h2 className="group-hover:text-primary font-medium transition-colors">
                {folder.name}
              </h2>
            </div>
          </Link>
        </li>
      ))}

      {contents.notes.map((note) => (
        <li key={note.slug}>
          <Link
            href={`/notes/${encodeURIComponent(note.slug)}`}
            className="border-border/60 bg-card hover:border-primary/40 group flex flex-col gap-2 rounded-lg border p-4 transition-colors"
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
  )
}

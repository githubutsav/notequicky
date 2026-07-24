import Link from "next/link"
import { getDirectoryContents } from "@/lib/notes"
import { NoteList } from "@/components/note-list"

export default function HomePage() {
  const rootContents = getDirectoryContents("")

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-8 md:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Field Notes
        </h1>
        <p className="text-muted-foreground text-pretty leading-relaxed">
          A personal knowledge base. Browse folders or search
          with <kbd className="bg-muted rounded border px-1.5 py-0.5 font-mono text-xs">⌘S</kbd>.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {rootContents.notes.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Root Notes</h2>
            <NoteList contents={{ folders: [], notes: rootContents.notes }} />
          </section>
        )}

        {rootContents.folders.map((folder) => {
          const folderContents = getDirectoryContents(folder.path)
          return (
            <section key={folder.path} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight capitalize">
                  {folder.name.replace(/-/g, ' ')}
                </h2>
                <Link
                  href={`/folders/${folder.path}`}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View Folder →
                </Link>
              </div>
              <NoteList contents={folderContents} />
            </section>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import Fuse from "fuse.js"

export interface SearchNote {
  slug: string
  title: string
  description: string
  searchText: string
}

export function SearchDialog({ notes }: { notes: SearchNote[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const fuse = useMemo(() => {
    return new Fuse(notes, {
      keys: [
        { name: "title", weight: 3 },
        { name: "description", weight: 2 },
        { name: "searchText", weight: 1 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    })
  }, [notes])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return notes
    return fuse.search(q).map((result) => result.item)
  }, [query, notes, fuse])

  function go(slug: string) {
    setOpen(false)
    setQuery("")
    router.push(`/notes/${slug}`)
  }

  return (
    <>
      <Button
        id="search-dialog-trigger"
        variant="outline"
        size="sm"
        className="text-muted-foreground gap-2 bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search notes...</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
          ⌘S
        </kbd>
        <span className="sr-only">Search notes</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-3 p-4">
          <DialogHeader>
            <DialogTitle className="sr-only">Search notes</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Type to search titles and content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229 &&
                results.length > 0
              ) {
                go(results[0].slug)
              }
            }}
          />
          <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {results.length === 0 && (
              <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                No notes found.
              </li>
            )}
            {results.map((note) => (
              <li key={note.slug}>
                <button
                  type="button"
                  onClick={() => go(note.slug)}
                  className="hover:bg-accent hover:text-accent-foreground flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors"
                >
                  <FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {note.title}
                    </span>
                    {note.description && (
                      <span className="text-muted-foreground line-clamp-1 text-xs">
                        {note.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}

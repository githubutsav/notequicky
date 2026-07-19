"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, NotebookPen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NoteNav, type NavNote, type NavTag } from "@/components/note-nav"
import { SearchDialog, type SearchNote } from "@/components/search-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader({
  notes,
  tags,
  searchNotes,
}: {
  notes: NavNote[]
  tags: NavTag[]
  searchNotes: SearchNote[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2 text-base">
                <NotebookPen className="text-primary size-4" />
                Field Notes
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-3.5rem)] px-3 py-4">
              <NoteNav
                notes={notes}
                tags={tags}
                onNavigate={() => setOpen(false)}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <NotebookPen className="text-primary size-5" />
          <span>Field Notes</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <SearchDialog notes={searchNotes} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

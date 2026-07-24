"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NoteNav } from "@/components/note-nav"
import { cn } from "@/lib/utils"

export function AppLayout({ 
  children, 
  navNotes, 
  searchNotes 
}: {
  children: React.ReactNode
  navNotes: any
  searchNotes: any
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Increase keyboard arrow scroll speed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with inputs or dialogs
      if (
        (document.activeElement as HTMLElement)?.tagName === "INPUT" ||
        (document.activeElement as HTMLElement)?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        window.scrollBy({ top: 120, behavior: "auto" })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        window.scrollBy({ top: -120, behavior: "auto" })
      }
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false })
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <SiteHeader 
        notes={navNotes} 
        searchNotes={searchNotes} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="mx-auto flex w-full max-w-7xl">
        {sidebarOpen && (
          <aside id="nav-sidebar" className="border-border/40 bg-background/50 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r backdrop-blur md:block">
            <div className="py-6 pr-6">
              <NoteNav notes={navNotes} />
            </div>
          </aside>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  )
}

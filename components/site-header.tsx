"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, NotebookPen, Maximize, Minimize, Star, Highlighter, Plus, Eraser, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useHighlightMode } from "@/components/highlight-mode-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NoteNav, type NavNote } from "@/components/note-nav"
import { SearchDialog, type SearchNote } from "@/components/search-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"

function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  return (
    <Button id="fullscreen-trigger" variant="ghost" size="icon" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
      {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
    </Button>
  )
}

export function SiteHeader({
  notes,
  searchNotes,
  onToggleSidebar,
}: {
  notes: NavNote[]
  searchNotes: SearchNote[]
  onToggleSidebar?: () => void
}) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { isHighlightMode, toggleHighlightMode, highlightColor, setHighlightColor } = useHighlightMode()

  const colors = [
    { id: "yellow", class: "bg-yellow-500", text: "text-yellow-500" },
    { id: "green", class: "bg-green-500", text: "text-green-500" },
    { id: "blue", class: "bg-blue-500", text: "text-blue-500" },
    { id: "pink", class: "bg-pink-500", text: "text-pink-500" },
    { id: "purple", class: "bg-purple-500", text: "text-purple-500" },
    { id: "eraser", class: "bg-muted border-2 border-dashed border-muted-foreground/50", text: "text-muted-foreground" },
  ] as const

  const activeColorObj = colors.find((c) => c.id === highlightColor) || colors[0]

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        {/* Mobile Sidebar Toggle */}
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
                onNavigate={() => setOpen(false)}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar Toggle */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" />
          </Button>
        )}

        <Link
          id="header-logo"
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight ml-2 lg:ml-0"
        >
          <NotebookPen className="text-primary size-5" />
          <span>Field Notes</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {session?.user && (
            <div className="flex items-center gap-1 mr-1">
              <Button variant="ghost" size="icon" render={<Link href="/notes/new?edit=true" />} title="Create New Note" nativeButton={false}>
                <Plus className="size-5" />
              </Button>
              <div className="flex items-center">
                <Button
                  variant={isHighlightMode ? "default" : "ghost"}
                  size="icon"
                  onClick={toggleHighlightMode}
                  title="Toggle Highlight Mode"
                  className={`rounded-r-none ${isHighlightMode ? `${activeColorObj.class} hover:${activeColorObj.class}/90 ${activeColorObj.id !== 'eraser' ? 'text-white' : 'text-muted-foreground'}` : ""}`}
                >
                  {activeColorObj.id === "eraser" ? (
                    <Eraser className={`size-4 ${isHighlightMode ? "" : activeColorObj.text}`} />
                  ) : (
                    <Highlighter className={`size-4 ${isHighlightMode ? "text-white" : activeColorObj.text}`} />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button
                      variant={isHighlightMode ? "default" : "ghost"}
                      size="icon"
                      className={`w-5 rounded-l-none border-l ${isHighlightMode ? `${activeColorObj.class} border-white/20 hover:${activeColorObj.class}/90 ${activeColorObj.id !== 'eraser' ? 'text-white' : 'text-muted-foreground'}` : "border-border/50"}`}
                    />
                  }>
                    <ChevronDown className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-max flex items-center gap-1.5 p-2">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setHighlightColor(c.id)
                        if (!isHighlightMode) toggleHighlightMode()
                      }}
                      className={`shrink-0 flex items-center justify-center size-6 rounded-full ${c.class} transition-transform hover:scale-110 ${highlightColor === c.id ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                    >
                      {c.id === "eraser" && <Eraser className="size-3.5 opacity-70" />}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
              <Button variant="ghost" size="icon" render={<Link href="/my/favorites" />} title="My Favorites" nativeButton={false}>
                <Star className="size-4 text-rose-500" />
              </Button>
            </div>
          )}
          <SearchDialog notes={searchNotes} />
          <FullscreenButton />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

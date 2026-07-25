"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, NotebookPen, Maximize, Minimize, Star, Highlighter, Eraser, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useHighlightMode } from "@/components/highlight-mode-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
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
  ] as const

  const [paintColor, setPaintColor] = useState<(typeof colors)[number]["id"]>(
    highlightColor === "eraser" ? "yellow" : highlightColor as (typeof colors)[number]["id"]
  )
  const activeColorObj = colors.find((c) => c.id === paintColor) || colors[0]
  const highlighterActive = isHighlightMode && highlightColor !== "eraser"
  const eraserActive = isHighlightMode && highlightColor === "eraser"

  const togglePaintTool = () => {
    if (highlighterActive) {
      toggleHighlightMode()
      return
    }

    setHighlightColor(paintColor)
    if (!isHighlightMode) toggleHighlightMode()
  }

  const toggleEraserTool = () => {
    if (eraserActive) {
      toggleHighlightMode()
      return
    }

    setHighlightColor("eraser")
    if (!isHighlightMode) toggleHighlightMode()
  }

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
              <div className="flex items-center gap-1">
                <Button
                  variant={highlighterActive ? "default" : "ghost"}
                  size="icon"
                  onClick={togglePaintTool}
                  title="Highlight text"
                  aria-label="Highlight text"
                  aria-pressed={highlighterActive}
                  className={highlighterActive ? `${activeColorObj.class} text-white hover:opacity-90` : ""}
                >
                  <Highlighter className={`size-4 ${highlighterActive ? "text-white" : activeColorObj.text}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button
                      variant={highlighterActive ? "default" : "ghost"}
                      size="icon"
                      aria-label="Choose highlight color"
                      className={`w-5 border-l ${highlighterActive ? `${activeColorObj.class} border-white/20 text-white hover:opacity-90` : "border-border/50"}`}
                    />
                  }>
                    <ChevronDown className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-max flex items-center gap-1.5 p-2">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setPaintColor(c.id)
                        setHighlightColor(c.id)
                        if (!isHighlightMode) toggleHighlightMode()
                      }}
                      className={`shrink-0 flex items-center justify-center size-6 rounded-full ${c.class} transition-transform hover:scale-110 ${highlightColor === c.id ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                    >
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
                <Button
                  variant={eraserActive ? "default" : "ghost"}
                  size="icon"
                  onClick={toggleEraserTool}
                  title="Erase highlights"
                  aria-label="Erase highlights"
                  aria-pressed={eraserActive}
                  className={eraserActive ? "bg-muted text-foreground ring-1 ring-border hover:bg-muted/80" : "text-muted-foreground hover:text-foreground"}
                >
                  <Eraser className="size-4" />
                </Button>
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

"use client"

import Link from "next/link"
import { ArrowUpToLine, ArrowDownToLine, ChevronLeft, ChevronRight } from "lucide-react"

export function QuickActions({ prev, next }: { prev?: any, next?: any }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
  }

  return (
    <div className="mt-auto flex flex-col gap-3 border-t border-border/50 pt-6 pb-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Quick Actions
      </p>
      
      <div className="flex flex-col gap-1">
        {/* Scroll Controls */}
        <button
          onClick={scrollToTop}
          title="Scroll to the top of the page"
          className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowUpToLine className="size-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5" />
          <span>Scroll to Top</span>
        </button>

        <button
          onClick={scrollToBottom}
          title="Scroll to the bottom of the page"
          className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowDownToLine className="size-3.5 shrink-0 transition-transform group-hover:translate-y-0.5" />
          <span>Scroll to Bottom</span>
        </button>

        {prev && (
          <Link
            href={`/notes/${prev.slug.split('/').map(encodeURIComponent).join('/')}`}
            title={`Previous: ${prev.title}`}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="size-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="truncate">Previous Note</span>
          </Link>
        )}

        {next && (
          <Link
            href={`/notes/${next.slug.split('/').map(encodeURIComponent).join('/')}`}
            title={`Next: ${next.title}`}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span className="truncate">Next Note</span>
          </Link>
        )}
      </div>
    </div>
  )
}

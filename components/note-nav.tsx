"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface NavNote {
  slug: string
  title: string
}

export interface NavTag {
  tag: string
  count: number
}

export function NoteNav({
  notes,
  tags,
  onNavigate,
}: {
  notes: NavNote[]
  tags: NavTag[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Notes" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground px-2 text-xs font-medium tracking-wide uppercase">
          Notes
        </p>
        {notes.map((note) => {
          const href = `/notes/${note.slug}`
          const active = pathname === href
          return (
            <Link
              key={note.slug}
              href={href}
              onClick={onNavigate}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground/80 hover:bg-accent/60 hover:text-accent-foreground",
              )}
            >
              {note.title}
            </Link>
          )
        })}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground px-2 text-xs font-medium tracking-wide uppercase">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5 px-2">
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tags/${tag}`} onClick={onNavigate}>
                <Badge
                  variant={pathname === `/tags/${tag}` ? "default" : "secondary"}
                  className="cursor-pointer"
                >
                  {tag}
                  <span className="opacity-60">{count}</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

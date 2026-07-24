"use client"

import { useEffect, useState } from "react"
import type { Heading } from "@/lib/notes"
import { cn } from "@/lib/utils"

export function Toc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    if (activeId) {
      const activeEl = document.getElementById(`toc-${activeId}`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [activeId])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        On this page
      </p>
      <ul className="flex flex-col gap-1 text-sm pb-10">
        {headings.map((heading, index) => (
          <li key={`${heading.slug}-${index}`} id={`toc-${heading.slug}`}>
            <a
              href={`#${heading.slug}`}
              className={cn(
                "block py-0.5 transition-colors",
                heading.depth === 3 && "pl-4",
                activeId === heading.slug
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

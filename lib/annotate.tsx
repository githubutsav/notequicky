import React from "react"
import type { ReactNode } from "react"

export const BLOCK_SELECTORS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th"

export const COLOR_MAP: Record<string, string> = {
  yellow: "hl-yellow",
  green: "hl-green",
  blue: "hl-blue",
  pink: "hl-pink",
  purple: "hl-purple",
}

export type BlockHighlight = {
  id: string
  startOffset: number
  endOffset: number
  color: string | null
}

/**
 * Walk a ReactMarkdown children tree and inject <mark> elements at the
 * correct character positions. Pure — no DOM mutations.
 *
 * `offset` is a shared mutable counter that tracks how many characters we've
 * consumed so far within the current block. It must be reset to {current: 0}
 * for each block.
 */
export function annotateChildren(
  children: ReactNode,
  highlights: BlockHighlight[],
  offset: { current: number },
  eraserActive: boolean,
  onErase: (id: string) => void
): ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return annotateText(child, highlights, offset, eraserActive, onErase)
    }
    if (React.isValidElement(child)) {
      const el = child as React.ReactElement<any>
      // Don't recurse into inline code — treat as opaque text
      if (el.type === "code") {
        offset.current += (typeof el.props.children === "string" ? el.props.children.length : 0)
        return child
      }
      return React.cloneElement(
        el,
        el.props,
        annotateChildren(el.props.children, highlights, offset, eraserActive, onErase)
      )
    }
    return child
  })
}

function annotateText(
  text: string,
  highlights: BlockHighlight[],
  offset: { current: number },
  eraserActive: boolean,
  onErase: (id: string) => void
): ReactNode {
  const textStart = offset.current
  const textEnd = textStart + text.length
  offset.current = textEnd

  // Find which highlights overlap this text run, translate to local coords
  const relevant = highlights
    .filter((h) => h.startOffset < textEnd && h.endOffset > textStart)
    .map((h) => ({
      ...h,
      localStart: Math.max(0, h.startOffset - textStart),
      localEnd: Math.min(text.length, h.endOffset - textStart),
    }))
    // Deduplicate: if two highlights start at the same position, keep only the first
    .sort((a, b) => a.localStart - b.localStart || b.localEnd - a.localEnd)

  if (relevant.length === 0) return text

  const parts: ReactNode[] = []
  let cursor = 0

  for (const hl of relevant) {
    // Skip entirely if this highlight is fully covered by previous output
    if (hl.localEnd <= cursor) continue

    // Clamp the start to where we currently are (handles partial overlaps)
    const effectiveStart = Math.max(hl.localStart, cursor)
    const effectiveEnd = hl.localEnd

    // Text before this highlight
    if (effectiveStart > cursor) {
      parts.push(text.slice(cursor, effectiveStart))
    }

    // The highlighted segment
    const bgClass = COLOR_MAP[hl.color || "yellow"] ?? COLOR_MAP.yellow
    parts.push(
      <mark
        key={hl.id}
        data-highlight-id={hl.id}
        onClick={eraserActive ? (e) => { e.stopPropagation(); onErase(hl.id) } : undefined}
        className={[
          "rounded-sm px-[1px] font-medium transition-all",
          bgClass,
          eraserActive
            ? "cursor-pointer hover:opacity-50 hover:line-through decoration-red-500 decoration-2"
            : "cursor-text",
        ].join(" ")}
        title={eraserActive ? "Click to erase" : ""}
      >
        {text.slice(effectiveStart, effectiveEnd)}
      </mark>
    )

    cursor = effectiveEnd
  }

  // Remaining text after last highlight
  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts
}

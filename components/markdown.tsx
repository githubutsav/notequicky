"use client"

import React, { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ReactNode } from "react"
import { slugifyHeading } from "@/lib/utils"
import { AlertCircle, Info, Lightbulb, TriangleAlert } from "lucide-react"
import { useHighlightMode } from "@/components/highlight-mode-provider"
import { useHighlightsStore } from "@/lib/stores/highlight-store"
import { deleteHighlight } from "@/app/actions"
import { toast } from "sonner"
import {
  createHighlighter,
  getHighlightRecord,
  registerHighlightRecord,
  restoreHighlights,
  setHighlightRecords,
} from "@/lib/web-highlighter"

export type HighlightObj = {
  id: string
  text: string
  color: string | null
  source?: string | null
  // kept for TS compat with existing DB records (not used for rendering)
  startOffset?: number | null
  endOffset?: number | null
  blockIndex?: number | null
  groupId?: string | null
}

function textOf(children: ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(textOf).join("")
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props
  ) {
    return textOf(children.props.children as ReactNode)
  }
  return ""
}

/** Parse ==highlighted== syntax into inline marks */
function processSyntaxHighlight(children: ReactNode): ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const parts = child.split(/(==[^=]+==)/g)
      if (parts.length === 1) return child
      return parts.map((part, i) => {
        if (part.startsWith("==") && part.endsWith("==")) {
          return (
            <mark key={i} className="rounded-sm bg-yellow-200/80 px-1.5 py-0.5 font-medium text-amber-900 dark:bg-yellow-900/50 dark:text-amber-200">
              {part.slice(2, -2)}
            </mark>
          )
        }
        return part
      })
    }
    if (React.isValidElement(child)) {
      const el = child as React.ReactElement<any>
      if (el.type === "code" || el.type === "img" || typeof el.type === "function" || !el.props?.children) {
        return child
      }
      return React.cloneElement(el, el.props, processSyntaxHighlight(el.props.children))
    }
    return child
  })
}

const PureMarkdown = React.memo(function PureMarkdown({
  content
}: {
  content: string
}) {
  const blockIdxRef = useRef(0)
  blockIdxRef.current = 0 // reset on every render

  const makeBlock = (
    Tag: keyof React.JSX.IntrinsicElements,
    children: ReactNode,
    extraProps: Record<string, any> = {}
  ) => {
    const idx = blockIdxRef.current++
    return React.createElement(
      Tag,
      { "data-block-index": idx, ...extraProps },
      processSyntaxHighlight(children)
    )
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => makeBlock("h1", children),
        h2: ({ children }) =>
          makeBlock("h2", children, { id: slugifyHeading(textOf(children)) }),
        h3: ({ children }) =>
          makeBlock("h3", children, { id: slugifyHeading(textOf(children)) }),
        h4: ({ children }) => makeBlock("h4", children),
        h5: ({ children }) => makeBlock("h5", children),
        h6: ({ children }) => makeBlock("h6", children),
        p:  ({ children }) => makeBlock("p", children),
        li: ({ children }) => makeBlock("li", children),
        td: ({ children }) => makeBlock("td", children),
        th: ({ children }) => makeBlock("th", children),

        img: ({ src, alt }) => {
          if (!src) return null
          return (
            <figure className="my-6 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border bg-muted/20 p-2 shadow-sm transition-all hover:shadow-md max-w-full">
              <img
                src={src}
                alt={alt || "Image"}
                className="max-h-[500px] w-auto max-w-full rounded-lg object-contain"
                loading="lazy"
              />
              {alt && (
                <figcaption className="pb-1 text-center text-xs font-medium text-muted-foreground">
                  {alt}
                </figcaption>
              )}
            </figure>
          )
        },

        blockquote: ({ children }) => {
          const idx = blockIdxRef.current++

          // GitHub-style alerts: > [!NOTE], > [!TIP], etc.
          let type: string | null = null
          const stripTag = (node: any): any => {
            if (typeof node === "string") {
              const match = node.match(/^\[!(\w+)\]\s*/)
              if (match) {
                type = match[1].toLowerCase()
                return node.replace(/^\[!(\w+)\]\s*/, "")
              }
              return node
            }
            if (React.isValidElement(node)) {
              const el = node as React.ReactElement<any>
              return React.cloneElement(el, el.props, React.Children.map(el.props.children, stripTag))
            }
            return node
          }

          const strippedChildren = React.Children.map(children, stripTag)
          const processed = processSyntaxHighlight(strippedChildren)

          if (type) {
            const icons: Record<string, ReactNode> = {
              note:      <Info className="size-4 text-blue-600 dark:text-blue-400" />,
              tip:       <Lightbulb className="size-4 text-green-600 dark:text-green-400" />,
              important: <AlertCircle className="size-4 text-violet-600 dark:text-violet-400" />,
              warning:   <TriangleAlert className="size-4 text-orange-600 dark:text-orange-400" />,
              caution:   <AlertCircle className="size-4 text-red-600 dark:text-red-400" />,
            }
            const colors: Record<string, string> = {
              note:      "border-blue-500/30 bg-blue-500/10",
              tip:       "border-green-500/30 bg-green-500/10",
              important: "border-violet-500/30 bg-violet-500/10",
              warning:   "border-orange-500/30 bg-orange-500/10",
              caution:   "border-red-500/30 bg-red-500/10",
            }
            return (
              <div
                data-block-index={idx}
                className={`my-5 flex flex-col gap-2 rounded-xl border p-4 ${colors[type] ?? colors.note}`}
              >
                <div className="flex items-center gap-2 font-bold tracking-wide">
                  {icons[type] ?? icons.note}
                  <span>{(type as string).charAt(0).toUpperCase() + (type as string).slice(1)}</span>
                </div>
                <div className="text-sm opacity-90 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                  {processed}
                </div>
              </div>
            )
          }

          return <blockquote data-block-index={idx}>{processed}</blockquote>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

export function Markdown({
  content,
  highlights = [],
  noteSlug,
}: {
  content: string
  highlights?: HighlightObj[]
  noteSlug: string
}) {
  const { isHighlightMode, highlightColor } = useHighlightMode()
  const eraserActive = isHighlightMode && highlightColor === "eraser"
  const removeHighlight = useHighlightsStore((s) => s.removeHighlight)
  const proseRef = useRef<HTMLDivElement>(null)
  // Keep a stable ref to the current highlighter instance
  const hlRef = useRef<any>(null)

  // ── Init highlighter + restore saved highlights ────────────────────
  useEffect(() => {
    const root = proseRef.current
    if (!root) return

    // Destroy any previous instance (e.g. content changed)
    if (hlRef.current) {
      try { hlRef.current.dispose() } catch {}
      hlRef.current = null
      ;(root as any).__wh_instance = null
    }

    const hl = createHighlighter(root)
    hlRef.current = hl
    // Expose on DOM node so TextSelectionMenu can reuse without context
    ;(root as any).__wh_instance = hl

    // Restore only highlights that have the new `source` field
    const withSource = highlights
      .filter((h) => !!h.source)
      .map((h) => ({ id: h.id, source: h.source!, color: h.color }))
    setHighlightRecords(root, withSource)
    restoreHighlights(hl, withSource)

    return () => {
      try {
        hl.removeAll() // Revert all DOM mutations!
        hl.dispose()
      } catch {}
      hlRef.current = null
      ;(root as any).__wh_instance = null
      ;(root as any).__wh_record_map = undefined
    }
    // Re-run when highlights list changes (e.g. after save or delete)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, content])

  // ── Eraser pointer handler ─────────────────────────────────────────
  useEffect(() => {
    const root = proseRef.current
    if (!root || !eraserActive) return

    let deleting = false

    const handlePointerDown = async (e: PointerEvent) => {
      const target = e.target
      if (!(target instanceof Element)) return
      const hlEl = target.closest("[data-highlight-id]") as HTMLElement | null
      if (!hlEl) return

      if (deleting) return
      deleting = true
      e.preventDefault()
      e.stopPropagation()

      const sourceIds = [
        hlEl.dataset.highlightId,
        ...(hlEl.dataset.highlightIdExtra?.split(";") ?? []),
      ].filter((id): id is string => Boolean(id))
      const sourceId = sourceIds[0]
      const record = sourceIds
        .map((id) => getHighlightRecord(root, id))
        .find((highlight) => highlight !== null)
      const recordId = record?.id ?? hlEl.dataset.highlightRecordId ?? sourceId

      if (!sourceId) {
        deleting = false
        return
      }

      try {
        const deleted = await deleteHighlight(recordId, noteSlug, sourceId)
        if (!deleted) throw new Error("Highlight no longer exists")

        hlRef.current?.remove(sourceId)
        removeHighlight(deleted.id) // Update Zustand store directly
        toast.success("Highlight erased")
      } catch {
        toast.error("Failed to erase highlight")
      } finally {
        deleting = false
      }
    }

    root.addEventListener("pointerdown", handlePointerDown, true)
    return () => root.removeEventListener("pointerdown", handlePointerDown, true)
  }, [eraserActive, noteSlug])

  // We use key={content} on a wrapper div to force React to completely discard 
  // the old DOM tree when content changes. This prevents React from crashing 
  // when trying to reconcile a DOM that web-highlighter has mutated!
  return (
    <div key={content} className="note-prose" ref={proseRef}>
      <PureMarkdown content={content} />
    </div>
  )
}

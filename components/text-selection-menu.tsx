"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { Highlighter, Star, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { saveBatchHighlight, saveFavorite, replaceHighlights } from "@/app/actions"
import { useHighlightModeStore, useHighlightsStore } from "@/lib/stores/highlight-store"
import { applyColorClass } from "@/lib/web-highlighter"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TextSelectionMenu() {
  const { data: session } = useSession()
  const isHighlightMode = useHighlightModeStore((s) => s.isHighlightMode)
  const highlightColor = useHighlightModeStore((s) => s.highlightColor)
  const addHighlights = useHighlightsStore((s) => s.addHighlights)
  const removeHighlight = useHighlightsStore((s) => s.removeHighlight)
  const pathname = usePathname()
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [pendingRange, setPendingRange] = useState<Range | null>(null)
  const [pendingText, setPendingText] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isSavingRef = useRef(false)

  const noteSlug = pathname === "/" ? "home" : pathname.split("/").pop() || "unknown"

  const persistHighlight = useCallback(async (range: Range, text: string) => {
    if (isSavingRef.current) return

    const prose = getProseRoot(range)
    if (!prose) {
      toast.error("Select text inside the note")
      return
    }

    isSavingRef.current = true
    setIsSaving(true)
    try {
      await saveFromRange(range, text, highlightColor, noteSlug, prose, {
        addHighlights,
        removeHighlight,
        replaceHighlights: useHighlightsStore.getState().replaceHighlights,
      })
      toast.success("Highlight saved")
    } catch {
      toast.error("Failed to save highlight")
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [highlightColor, noteSlug, addHighlights, removeHighlight])

  useEffect(() => {
    if (!session?.user) return

    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (!text) {
        setPosition(null)
        setPendingRange(null)
        return
      }

      const range = selection?.getRangeAt(0)
      if (!range) return

      if (!getProseRoot(range)) return

      const rect = range.getBoundingClientRect()
      setPosition({ top: rect.top - 50, left: rect.left + rect.width / 2 })
      setPendingRange(range.cloneRange())
      setPendingText(text)

      // In highlight mode: immediately save without showing the popover
      if (isHighlightMode && highlightColor !== "eraser") {
        void persistHighlight(range.cloneRange(), text)
        window.getSelection()?.removeAllRanges()
        setPosition(null)
      }

      if (isHighlightMode && highlightColor === "eraser") {
        window.getSelection()?.removeAllRanges()
        setPosition(null)
      }
    }

    document.addEventListener("mouseup", handleSelection)
    document.addEventListener("keyup", handleSelection)
    return () => {
      document.removeEventListener("mouseup", handleSelection)
      document.removeEventListener("keyup", handleSelection)
    }
  }, [session, isHighlightMode, highlightColor, noteSlug, persistHighlight])

  if (!position || !session?.user || isHighlightMode) return null

  const handleHighlight = () => {
    if (!pendingRange) return
    void persistHighlight(pendingRange, pendingText)
    window.getSelection()?.removeAllRanges()
    setPosition(null)
  }

  const handleFavorite = async () => {
    setIsSaving(true)
    try {
      await saveFavorite(pendingText, noteSlug)
      window.getSelection()?.removeAllRanges()
      setPosition(null)
      toast.success("Favorite saved")
    } catch {
      toast.error("Failed to save favorite")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        transform: "translateX(-50%)",
      }}
      className="flex gap-1 rounded-md border bg-background p-1 shadow-lg animate-in fade-in zoom-in duration-150"
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
        onClick={handleHighlight}
        disabled={isSaving}
        title="Highlight"
      >
        <Highlighter className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
        onClick={handleFavorite}
        disabled={isSaving}
        title="Favorite"
      >
        {isSaving ? <Loader2 className="size-4 animate-spin text-foreground" /> : <Star className="size-4" />}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Use web-highlighter to stamp a DOM range, serialize the position, save to DB,
 * then update the Zustand highlights store directly (no window events needed).
 */
async function saveFromRange(
  range: Range,
  text: string,
  color: string,
  noteSlug: string,
  prose: HTMLElement,
  storeActions: {
    addHighlights: (batch: any[]) => void
    removeHighlight: (id: string) => void
    replaceHighlights: (removedIds: string[], created: any) => void
  }
) {
  // Dynamically import to avoid SSR issues
  const {
    applyColorClass,
    createHighlighter,
    getHighlightRecord,
    registerHighlightRecord,
    restoreHighlights,
  } = await import("@/lib/web-highlighter")

  // Get (or reuse) the shared highlighter instance attached to the root
  let hl: any = (prose as any).__wh_instance
  if (!hl) {
    hl = createHighlighter(prose)
    ;(prose as any).__wh_instance = hl
  }

  const trimmedRange = trimRangeWhitespace(prose, range)
  const mergedHighlights = findAdjacentHighlights(prose, trimmedRange, color, getHighlightRecord)
  const selectedOffsets = rangeTextOffsets(prose, trimmedRange)

  // Recreate a continuous highlight from clean text, so adjacent selections
  // do not retain separate wrappers or a visual seam between them.
  for (const highlight of mergedHighlights) {
    hl.remove(highlight.sourceId)
  }

  const rangeToHighlight = mergedHighlights.length
    ? rangeFromTextOffsets(
        prose,
        Math.min(selectedOffsets.start, ...mergedHighlights.map((item) => item.start)),
        Math.max(selectedOffsets.end, ...mergedHighlights.map((item) => item.end))
      )
    : trimmedRange

  // fromRange returns one serializable source for the selected range.
  const source = hl.fromRange(rangeToHighlight)
  if (!source) {
    if (mergedHighlights.length) {
      restoreHighlights(hl, mergedHighlights.map((item) => item.record))
    }
    throw new Error("Could not create highlight")
  }

  // 1. OPTIMISTIC UPDATE: Apply color CSS classes to the DOM immediately!
  applyColorClass(source.id, color)

  // 2. Prepare records
  const records = [{
    text: source.text || text,
    noteSlug,
    color,
    source: JSON.stringify({
      startMeta: source.startMeta,
      endMeta: source.endMeta,
      id: source.id,
      text: source.text || text,
    }),
  }]

  // 3. Persist, then update Zustand store directly (no window events!)
  try {
    const createdHighlight = mergedHighlights.length
      ? await replaceHighlights(mergedHighlights.map((item) => item.record.id), records[0])
      : (await saveBatchHighlight(records))[0]
    if (!createdHighlight) throw new Error("Highlight was not saved")

    applyColorClass(source.id, color, createdHighlight.id)
    registerHighlightRecord(prose, createdHighlight)

    // Update Zustand store directly instead of window.dispatchEvent
    if (mergedHighlights.length) {
      storeActions.replaceHighlights(
        mergedHighlights.map((item) => item.record.id),
        createdHighlight
      )
    } else {
      storeActions.addHighlights([createdHighlight])
    }
  } catch (error) {
    // Rollback: remove the optimistic DOM changes if the network fails
    hl.remove(source.id)
    if (mergedHighlights.length) {
      restoreHighlights(hl, mergedHighlights.map((item) => item.record))
    }
    throw error
  }
}

type StoredRecord = {
  id: string
  source: string | null
  color: string | null
}

type AdjacentHighlight = {
  sourceId: string
  record: StoredRecord
  start: number
  end: number
}

function getProseRoot(range: Range) {
  const node = range.commonAncestorContainer
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  return element?.closest<HTMLElement>(".note-prose") ?? null
}

function getWrapperSourceIds(wrapper: HTMLElement) {
  return [
    wrapper.dataset.highlightId,
    ...(wrapper.dataset.highlightIdExtra?.split(";") ?? []),
  ].filter((id): id is string => Boolean(id))
}

function rangeTextOffsets(root: HTMLElement, range: Range) {
  const offsetAt = (container: Node, offset: number) => {
    const before = document.createRange()
    before.selectNodeContents(root)
    before.setEnd(container, offset)
    return before.toString().length
  }

  return {
    start: offsetAt(range.startContainer, range.startOffset),
    end: offsetAt(range.endContainer, range.endOffset),
  }
}

function rangeFromTextOffsets(root: HTMLElement, start: number, end: number) {
  const pointAt = (target: number): [Text, number] => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let total = 0
    let node: Text | null = null
    let lastNode: Text | null = null

    while ((node = walker.nextNode() as Text | null)) {
      lastNode = node
      const nextTotal = total + node.data.length
      if (target <= nextTotal) return [node, Math.max(0, target - total)]
      total = nextTotal
    }

    if (!lastNode) throw new Error("Note content is unavailable")
    return [lastNode, lastNode.data.length]
  }

  const [startNode, startOffset] = pointAt(start)
  const [endNode, endOffset] = pointAt(end)
  const range = document.createRange()
  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)
  return range
}

function trimRangeWhitespace(root: HTMLElement, range: Range) {
  const text = range.toString()
  const leading = text.match(/^\s*/)?.[0].length ?? 0
  const trailing = text.match(/\s*$/)?.[0].length ?? 0

  if (!leading && !trailing) return range

  const offsets = rangeTextOffsets(root, range)
  const start = offsets.start + leading
  const end = offsets.end - trailing

  if (start >= end) return range

  return rangeFromTextOffsets(root, start, end)
}

function findAdjacentHighlights(
  root: HTMLElement,
  range: Range,
  color: string,
  getHighlightRecord: (root: HTMLElement, sourceId: string) => StoredRecord | null
) {
  const selectedBlock = getSelectionBlock(range.commonAncestorContainer)
  if (!selectedBlock) return []

  const wrappersBySource = new Map<string, HTMLElement[]>()
  root.querySelectorAll<HTMLElement>("[data-highlight-id]").forEach((wrapper) => {
    if (getSelectionBlock(wrapper) !== selectedBlock) return
    for (const sourceId of getWrapperSourceIds(wrapper)) {
      const wrappers = wrappersBySource.get(sourceId) ?? []
      wrappers.push(wrapper)
      wrappersBySource.set(sourceId, wrappers)
    }
  })

  const candidates = [...wrappersBySource].flatMap(([sourceId, wrappers]) => {
    const record = getHighlightRecord(root, sourceId)
    if (!record || (record.color ?? "yellow") !== color) return []

    const positions = wrappers.map((wrapper) => {
      const wrapperRange = document.createRange()
      wrapperRange.selectNodeContents(wrapper)
      return rangeTextOffsets(root, wrapperRange)
    })

    return [{
      sourceId,
      record,
      start: Math.min(...positions.map((position) => position.start)),
      end: Math.max(...positions.map((position) => position.end)),
    }]
  })

  const selected = rangeTextOffsets(root, range)
  let start = selected.start
  let end = selected.end
  const adjacent: AdjacentHighlight[] = []
  let found = true

  while (found) {
    found = false
    for (const candidate of candidates) {
      if (adjacent.some((item) => item.sourceId === candidate.sourceId)) continue

      const gap = candidate.end <= start
        ? root.textContent?.slice(candidate.end, start)
        : candidate.start >= end
          ? root.textContent?.slice(end, candidate.start)
          : ""

      if (!/^[ \t]{0,8}$/.test(gap ?? "")) continue

      adjacent.push(candidate)
      start = Math.min(start, candidate.start)
      end = Math.max(end, candidate.end)
      found = true
    }
  }

  return adjacent
}

function getSelectionBlock(node: Node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  return element?.closest("h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, pre") ?? null
}

/**
 * Thin wrapper around the `web-highlighter` library.
 *
 * web-highlighter works directly on the real DOM (not the React VDOM),
 * which makes it much more reliable than custom offset counting.
 *
 * Serialisation format stored in DB (Highlight.source):
 *   JSON.stringify({ startMeta, endMeta, id, text })
 */

export const HL_COLOR_CLASSES: Record<string, string> = {
  yellow: "hl-yellow",
  green:  "hl-green",
  blue:   "hl-blue",
  pink:   "hl-pink",
  purple: "hl-purple",
}

export type StoredHighlight = {
  id: string
  source: string | null   // JSON string from web-highlighter
  color: string | null
}

type HighlighterRoot = HTMLElement & {
  __wh_instance?: any
  __wh_record_map?: Map<string, StoredHighlight>
}

/**
 * Create a new Highlighter instance bound to a root element.
 * Safe for SSR (returns null if window is undefined).
 */
export function createHighlighter(rootEl: HTMLElement): any {
  if (typeof window === "undefined") return null
  // Dynamic require prevents UMD web-highlighter from executing during SSR
  const Highlighter = require("web-highlighter").default || require("web-highlighter")
  return new Highlighter({
    $root: rootEl,
    // Images have no selectable text. Code remains selectable so notes can be
    // annotated consistently, including fenced code blocks and inline code.
    exceptSelectors: ["img"],
    style: {
      className: "hl-wrap",
    },
  })
}

export function getSourceId(source: string | null | undefined): string | null {
  if (!source) return null
  try {
    const parsed = JSON.parse(source)
    return typeof parsed.id === "string" ? parsed.id : null
  } catch {
    return null
  }
}

export function setHighlightRecords(root: HTMLElement, highlights: StoredHighlight[]) {
  const records = new Map<string, StoredHighlight>()
  for (const highlight of highlights) {
    const sourceId = getSourceId(highlight.source)
    if (sourceId) records.set(sourceId, highlight)
  }
  ;(root as HighlighterRoot).__wh_record_map = records
}

export function getHighlightRecord(root: HTMLElement, sourceId: string) {
  return (root as HighlighterRoot).__wh_record_map?.get(sourceId) ?? null
}

export function registerHighlightRecord(root: HTMLElement, highlight: StoredHighlight) {
  const sourceId = getSourceId(highlight.source)
  if (!sourceId) return

  const highlighterRoot = root as HighlighterRoot
  highlighterRoot.__wh_record_map ??= new Map()
  highlighterRoot.__wh_record_map.set(sourceId, highlight)
}

/**
 * Restore previously saved highlights from the database.
 * Only handles records that have a `source` field (new format).
 */
export function restoreHighlights(
  highlighter: any,
  highlights: StoredHighlight[]
) {
  for (const hl of highlights) {
    if (!hl.source) continue
    try {
      const { startMeta, endMeta, id, text } = JSON.parse(hl.source)
      if (typeof id !== "string" || typeof text !== "string") continue

      // web-highlighter expects text before id. Reversing these values prevents
      // a saved range from being reconstructed after a refresh.
      const restored = highlighter.fromStore(startMeta, endMeta, text, id)
      if (restored) {
        // The DOM range is addressed by the library source ID, while deletion
        // needs the database record ID. Keep both identities on the wrapper.
        applyColorClass(id, hl.color, hl.id)
      }
    } catch {
      // Malformed source — skip silently
    }
  }
}

function hasVisibleHighlightText(el: HTMLElement) {
  return Boolean(el.textContent?.replace(/\u00a0/g, " ").trim())
}

/**
 * Apply a color CSS class to all DOM nodes belonging to a highlight ID.
 */
export function applyColorClass(
  id: string,
  color: string | null,
  recordId: string = id
) {
  const cls = HL_COLOR_CLASSES[color ?? "yellow"] ?? HL_COLOR_CLASSES.yellow
  // web-highlighter wraps text in <span data-highlight-id="...">
  document
    .querySelectorAll<HTMLElement>(`[data-highlight-id="${id}"]`)
    .forEach((el) => {
      // Remove any other color classes first
      Object.values(HL_COLOR_CLASSES).forEach((c) => el.classList.remove(c))
      el.dataset.highlightRecordId = recordId

      if (!hasVisibleHighlightText(el)) {
        el.dataset.highlightHidden = "true"
        return
      }

      delete el.dataset.highlightHidden
      el.classList.add(cls)
    })
}

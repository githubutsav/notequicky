"use client"

import { create } from "zustand"

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple" | "eraser"

export interface HighlightObj {
  id: string
  text: string
  color: string | null
  source?: string | null
  startOffset?: number | null
  endOffset?: number | null
  blockIndex?: number | null
  groupId?: string | null
}

// ── Highlight Mode Store ────────────────────────────────────────────────────
interface HighlightModeState {
  isHighlightMode: boolean
  highlightColor: HighlightColor
  toggleHighlightMode: () => void
  setHighlightColor: (color: HighlightColor) => void
}

export const useHighlightModeStore = create<HighlightModeState>((set) => ({
  isHighlightMode: false,
  highlightColor: "yellow",
  toggleHighlightMode: () =>
    set((state) => ({ isHighlightMode: !state.isHighlightMode })),
  setHighlightColor: (color) => set({ highlightColor: color }),
}))

// ── Highlights List Store ───────────────────────────────────────────────────
interface HighlightsState {
  highlights: HighlightObj[]
  setHighlights: (highlights: HighlightObj[]) => void
  addHighlights: (batch: HighlightObj[]) => void
  removeHighlight: (id: string) => void
  replaceHighlights: (removedIds: string[], created: HighlightObj) => void
}

export const useHighlightsStore = create<HighlightsState>((set) => ({
  highlights: [],
  setHighlights: (highlights) => set({ highlights }),
  addHighlights: (batch) =>
    set((state) => ({ highlights: [...state.highlights, ...batch] })),
  removeHighlight: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),
  replaceHighlights: (removedIds, created) =>
    set((state) => ({
      highlights: [
        ...state.highlights.filter((h) => !removedIds.includes(h.id)),
        created,
      ],
    })),
}))

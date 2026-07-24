"use client"

// This file is kept for layout compatibility (HighlightModeProvider wrapper).
// All state is now managed by Zustand stores in lib/stores/highlight-store.ts

import React, { useEffect } from "react"
import { useHighlightModeStore } from "@/lib/stores/highlight-store"

export type { HighlightColor } from "@/lib/stores/highlight-store"

// Thin wrapper that applies body classes + selection CSS as side-effects
// This still lives in the tree so effects fire in one place.
export function HighlightModeProvider({ children }: { children: React.ReactNode }) {
  const isHighlightMode = useHighlightModeStore((s) => s.isHighlightMode)
  const highlightColor = useHighlightModeStore((s) => s.highlightColor)

  // Body class for cursor styling
  useEffect(() => {
    const classesToRemove = [
      "highlight-mode-active-yellow",
      "highlight-mode-active-green",
      "highlight-mode-active-blue",
      "highlight-mode-active-pink",
      "highlight-mode-active-purple",
      "highlight-mode-active-eraser",
    ]
    document.body.classList.remove(...classesToRemove)
    if (isHighlightMode) {
      document.body.classList.add(`highlight-mode-active-${highlightColor}`)
    }
  }, [isHighlightMode, highlightColor])

  // Selection color tint
  useEffect(() => {
    const styleId = "highlight-selection-override"
    const existing = document.getElementById(styleId)
    existing?.remove()

    if (!isHighlightMode || highlightColor === "eraser") return

    const selectionColors: Record<string, { bg: string; text: string }> = {
      yellow: { bg: "rgba(234,179,8,0.20)",  text: "inherit" },
      green:  { bg: "rgba(34,197,94,0.20)",  text: "inherit" },
      blue:   { bg: "rgba(59,130,246,0.20)", text: "inherit" },
      pink:   { bg: "rgba(236,72,153,0.20)", text: "inherit" },
      purple: { bg: "rgba(168,85,247,0.20)", text: "inherit" },
      eraser: { bg: "transparent",           text: "inherit" },
    }

    const { bg, text } = selectionColors[highlightColor]
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      .note-prose ::selection {
        background-color: ${bg} !important;
        color: ${text} !important;
      }
    `
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [isHighlightMode, highlightColor])

  return <>{children}</>
}

// Keep the old hook name working so no other files need changing
export function useHighlightMode() {
  const isHighlightMode = useHighlightModeStore((s) => s.isHighlightMode)
  const toggleHighlightMode = useHighlightModeStore((s) => s.toggleHighlightMode)
  const highlightColor = useHighlightModeStore((s) => s.highlightColor)
  const setHighlightColor = useHighlightModeStore((s) => s.setHighlightColor)
  return { isHighlightMode, toggleHighlightMode, highlightColor, setHighlightColor }
}

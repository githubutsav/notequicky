import { describe, it, expect, beforeEach } from "vitest"
import { useHighlightModeStore, useHighlightsStore } from "@/lib/stores/highlight-store"

describe("lib/stores/highlight-store", () => {
  beforeEach(() => {
    // Reset stores before each test
    useHighlightModeStore.setState({ isHighlightMode: false, highlightColor: "yellow" })
    useHighlightsStore.setState({ highlights: [] })
  })

  describe("useHighlightModeStore", () => {
    it("initializes with default state", () => {
      const state = useHighlightModeStore.getState()
      expect(state.isHighlightMode).toBe(false)
      expect(state.highlightColor).toBe("yellow")
    })

    it("toggles highlight mode correctly", () => {
      useHighlightModeStore.getState().toggleHighlightMode()
      expect(useHighlightModeStore.getState().isHighlightMode).toBe(true)

      useHighlightModeStore.getState().toggleHighlightMode()
      expect(useHighlightModeStore.getState().isHighlightMode).toBe(false)
    })

    it("updates highlight color", () => {
      useHighlightModeStore.getState().setHighlightColor("green")
      expect(useHighlightModeStore.getState().highlightColor).toBe("green")
    })
  })

  describe("useHighlightsStore", () => {
    const mockHighlight = {
      id: "hl-1",
      text: "Highlighted text",
      color: "yellow",
      source: "{}",
    }

    it("sets and retrieves highlights", () => {
      useHighlightsStore.getState().setHighlights([mockHighlight])
      expect(useHighlightsStore.getState().highlights).toEqual([mockHighlight])
    })

    it("adds a batch of highlights", () => {
      useHighlightsStore.getState().setHighlights([mockHighlight])
      
      const newHighlight = { id: "hl-2", text: "New text", color: "green", source: "{}" }
      useHighlightsStore.getState().addHighlights([newHighlight])

      expect(useHighlightsStore.getState().highlights).toHaveLength(2)
      expect(useHighlightsStore.getState().highlights[1]).toEqual(newHighlight)
    })

    it("removes a highlight by id", () => {
      useHighlightsStore.getState().setHighlights([mockHighlight])
      useHighlightsStore.getState().removeHighlight("hl-1")
      expect(useHighlightsStore.getState().highlights).toHaveLength(0)
    })

    it("replaces highlights correctly when merging adjacent highlights", () => {
      const hl1 = { id: "hl-1", text: "Part 1", color: "yellow", source: "{}" }
      const hl2 = { id: "hl-2", text: "Part 2", color: "yellow", source: "{}" }
      const merged = { id: "hl-merged", text: "Part 1 Part 2", color: "yellow", source: "{}" }

      useHighlightsStore.getState().setHighlights([hl1, hl2])
      useHighlightsStore.getState().replaceHighlights(["hl-1", "hl-2"], merged)

      expect(useHighlightsStore.getState().highlights).toHaveLength(1)
      expect(useHighlightsStore.getState().highlights[0]).toEqual(merged)
    })
  })
})

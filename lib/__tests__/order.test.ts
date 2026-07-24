import { describe, it, expect } from "vitest"
import { getOrder, CURRICULUM_ORDER } from "@/lib/order"

describe("lib/order", () => {
  it("returns correct order number for known curriculum slugs", () => {
    expect(getOrder("getting-started")).toBe(1)
    expect(getOrder("web-basics")).toBe(2)
    expect(getOrder("git-and-github")).toBe(3)
    expect(getOrder("javascript")).toBe(5)
  })

  it("handles nested directory paths correctly", () => {
    expect(getOrder("Backend-from-first-principle/study-guides/getting-started")).toBe(1)
    expect(getOrder("folder/subfolder/javascript")).toBe(5)
  })

  it("extracts numeric prefix for custom numbered notes", () => {
    expect(getOrder("05-custom-note")).toBe(5)
    expect(getOrder("42-another-note")).toBe(42)
  })

  it("returns fallback order (999) for unmapped custom slugs", () => {
    expect(getOrder("some-random-custom-note-slug")).toBe(999)
  })
})

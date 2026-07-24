import { describe, it, expect } from "vitest"
import { slugifyHeading, cn } from "@/lib/utils"

describe("lib/utils", () => {
  describe("slugifyHeading", () => {
    it("converts simple string to kebab-case slug", () => {
      expect(slugifyHeading("Getting Started")).toBe("getting-started")
    })

    it("strips special characters and extra spaces", () => {
      expect(slugifyHeading("React & State Management 101!")).toBe("react-state-management-101")
    })

    it("handles numbers and lowercase strings correctly", () => {
      expect(slugifyHeading("123 Test Heading")).toBe("123-test-heading")
    })
  })

  describe("cn", () => {
    it("merges class names and handles conditional classes", () => {
      expect(cn("px-2 py-1", false && "bg-red-500", "text-sm")).toBe("px-2 py-1 text-sm")
    })

    it("resolves Tailwind conflicts correctly via tailwind-merge", () => {
      expect(cn("px-2 px-4", "p-6")).toBe("p-6")
    })
  })
})

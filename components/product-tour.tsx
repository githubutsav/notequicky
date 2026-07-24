"use client"

import { useEffect } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function ProductTour() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const hasSeenTour = localStorage.getItem("quicky_tour_completed")
    if (hasSeenTour) return

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "#000000",
      overlayOpacity: 0.82,
      stagePadding: 8,
      stageRadius: 10,
      nextBtnText: "NEXT →",
      prevBtnText: "← PREVIOUS",
      doneBtnText: "FINISH TOUR ✓",
      steps: [
        {
          element: "#nav-sidebar",
          popover: {
            title: "1. SIDEBAR NAVIGATION",
            description: "Browse all topics,study guides, and video notes seamlessly from the sidebar.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#search-dialog-trigger",
          popover: {
            title: "2. FAST COMMAND SEARCH ",
            description: "Press Cmd + S (or click Search) to instantly find terms, code snippets, and topics across all notes.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#theme-toggle-trigger",
          popover: {
            title: "3. DARK & LIGHT THEME",
            description: "Toggle between high-contrast dark mode and clean light mode anytime for comfortable reading.",
            side: "bottom",
            align: "end",
          },
        },
        {
          popover: {
            title: "4. UNLOCK PERSONAL FEATURES 🔓",
            description: `
              <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 4px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div style="background: rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <div style="font-size: 16px;">✍️</div>
                    <div style="font-size: 11px; font-weight: 600; color: var(--foreground); margin-top: 2px;">Create Notes</div>
                  </div>
                  <div style="background: rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <div style="font-size: 16px;">🖍️</div>
                    <div style="font-size: 11px; font-weight: 600; color: var(--foreground); margin-top: 2px;">Text Highlights</div>
                  </div>
                  <div style="background: rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <div style="font-size: 16px;">⭐</div>
                    <div style="font-size: 11px; font-weight: 600; color: var(--foreground); margin-top: 2px;">Favorites Sync</div>
                  </div>
                  <div style="background: rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <div style="font-size: 16px;">☁️</div>
                    <div style="font-size: 11px; font-weight: 600; color: var(--foreground); margin-top: 2px;">Cloud Storage</div>
                  </div>
                </div>
                <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.5; color: var(--muted-foreground); text-align: center;">
                  Sign in anytime with Google or GitHub, or continue exploring as guest!
                </p>
              </div>
            `,
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem("quicky_tour_completed", "true")
      },
    })

    const timer = setTimeout(() => {
      driverObj.drive()
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return null
}

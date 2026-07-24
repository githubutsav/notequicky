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
      overlayOpacity: 0.75,
      stagePadding: 6,
      stageRadius: 8,
      nextBtnText: "NEXT →",
      prevBtnText: "← PREVIOUS",
      doneBtnText: "GET STARTED ✓",
      steps: [
        {
          element: "#nav-sidebar",
          popover: {
            title: "SIDEBAR NAVIGATION",
            description: "Browse all topics, search categories, study guides, and video notes seamlessly from the sidebar.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#search-dialog-trigger",
          popover: {
            title: "COMMAND SEARCH",
            description: "Press Cmd + S (or click Search) to instantly find terms, code snippets, and topics across all notes.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#theme-toggle-trigger",
          popover: {
            title: "THEME PREFERENCE",
            description: "Toggle between high-contrast dark mode and clean light mode anytime.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#auth-modal-trigger",
          popover: {
            title: "AUTHENTICATION & PROFILE",
            description: "Sign in with Google or GitHub to create personal notes, save highlights, and sync favorites.",
            side: "bottom",
            align: "end",
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

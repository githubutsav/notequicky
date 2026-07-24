import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Field Notes",
    short_name: "Notes",
    description:
      "A personal knowledge base of markdown notes — searchable, tagged, and readable anywhere.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1b19",
    theme_color: "#1c1b19",
    icons: [
      {
        src: "/pwa-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}

import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Highlighter, ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import { DeleteButton } from "@/components/delete-button"

export const metadata: Metadata = { title: "My Highlights" }
export const dynamic = "force-dynamic"

export default async function HighlightsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const highlights = await db.highlight.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const colorMap = {
    yellow: "border-yellow-400 bg-yellow-500/5 hover:border-yellow-500/30",
    green: "border-green-400 bg-green-500/5 hover:border-green-500/30",
    blue: "border-blue-400 bg-blue-500/5 hover:border-blue-500/30",
    pink: "border-pink-400 bg-pink-500/5 hover:border-pink-500/30",
    purple: "border-purple-400 bg-purple-500/5 hover:border-purple-500/30",
  } as Record<string, string>

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
          <Highlighter className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Highlights</h1>
          <p className="text-sm text-muted-foreground">{highlights.length} saved highlight{highlights.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {highlights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <Highlighter className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-lg font-medium">No highlights yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Select any text on a note page and click the highlighter icon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {highlights.map((h) => {
            const colorClass = colorMap[h.color || "yellow"] || colorMap.yellow
            return (
              <div
                key={h.id}
                className={`group relative rounded-xl border border-border/50 p-5 transition-all ${colorClass}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <blockquote className="flex-1 border-l-2 pl-4 text-sm leading-relaxed border-current whitespace-pre-wrap font-mono">
                    {h.text}
                  </blockquote>
                  <DeleteButton id={h.id} type="highlight" />
                </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/notes/${h.noteSlug}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {h.noteSlug}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

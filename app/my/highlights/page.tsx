import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Highlighter, ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import { DeleteButton } from "@/components/delete-button"

export const metadata: Metadata = { title: "My Highlights" }
export const dynamic = "force-dynamic"

function getWordCount(text: string) {
  const words = text.trim().match(/\S+/g)
  return words?.length ?? 0
}

function splitHighlightText(text: string) {
  const colonIndex = text.indexOf(":")
  if (colonIndex <= 0 || colonIndex > 80) return { lead: null, rest: text }

  return {
    lead: text.slice(0, colonIndex + 1),
    rest: text.slice(colonIndex + 1),
  }
}

type HighlightCardColor = {
  card: string
  stripe: string
  count: string
}

export default async function HighlightsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const highlights = await db.highlight.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const colorMap: Record<string, HighlightCardColor> = {
    yellow: {
      card: "border-amber-400/25 bg-[linear-gradient(135deg,rgba(180,136,0,0.88),rgba(112,91,0,0.8))] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-amber-300/45",
      stripe: "bg-amber-400",
      count: "text-amber-100/65",
    },
    green: {
      card: "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(32,113,65,0.86),rgba(18,79,45,0.78))] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-emerald-300/40",
      stripe: "bg-emerald-400",
      count: "text-emerald-100/65",
    },
    blue: {
      card: "border-blue-400/25 bg-[linear-gradient(135deg,rgba(41,87,166,0.9),rgba(31,62,139,0.82))] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-blue-300/45",
      stripe: "bg-sky-400",
      count: "text-blue-100/65",
    },
    pink: {
      card: "border-pink-400/25 bg-[linear-gradient(135deg,rgba(162,55,113,0.88),rgba(110,39,87,0.8))] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-pink-300/45",
      stripe: "bg-pink-400",
      count: "text-pink-100/65",
    },
    purple: {
      card: "border-violet-400/25 bg-[linear-gradient(135deg,rgba(111,70,168,0.88),rgba(74,49,137,0.8))] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-violet-300/45",
      stripe: "bg-violet-400",
      count: "text-violet-100/65",
    },
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
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
        <div className="flex max-w-[560px] flex-col gap-3">
          {highlights.map((h) => {
            const colorClass = colorMap[h.color || "yellow"] || colorMap.yellow
            const text = splitHighlightText(h.text)
            const wordCount = getWordCount(h.text)

            return (
              <div
                key={h.id}
                data-delete-item
                className={`group relative overflow-hidden rounded-md border py-2.5 pl-4 pr-9 text-white transition-all duration-200 ${colorClass.card}`}
              >
                <div className={`absolute inset-y-0 left-0 w-1.5 ${colorClass.stripe}`} />
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <DeleteButton id={h.id} type="highlight" />
                </div>

                <blockquote className="whitespace-pre-wrap text-base leading-snug text-white/90 [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]">
                  {text.lead ? <strong className="font-semibold text-white">{text.lead}</strong> : null}
                  {text.rest}
                  <span className={`ml-1.5 whitespace-nowrap text-xs font-medium ${colorClass.count}`}>
                    ({wordCount} {wordCount === 1 ? "word" : "words"})
                  </span>
                </blockquote>

                <div className="mt-0 flex max-h-0 items-center justify-between gap-3 overflow-hidden text-xs text-white/45 opacity-0 transition-all duration-200 group-hover:mt-2 group-hover:max-h-5 group-hover:opacity-100 group-focus-within:mt-2 group-focus-within:max-h-5 group-focus-within:opacity-100">
                  <Link
                    href={`/notes/${h.noteSlug}`}
                    className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-white/80"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{h.noteSlug}</span>
                  </Link>
                  <span className="shrink-0">
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

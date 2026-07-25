import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Star, ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import { DeleteButton } from "@/components/delete-button"

export const metadata: Metadata = { title: "My Favorites" }
export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
          <Star className="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Favorites</h1>
          <p className="text-sm text-muted-foreground">{favorites.length} saved favorite{favorites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <Star className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Select any text on a note page and click the star icon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((f) => (
            <div
              key={f.id}
              data-delete-item
              className="group relative rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-rose-500/30 hover:bg-rose-500/5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <blockquote className="flex-1 border-l-2 border-rose-400 pl-4 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {f.text}
                </blockquote>
                <DeleteButton id={f.id} type="favorite" />
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/notes/${f.noteSlug}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {f.noteSlug}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

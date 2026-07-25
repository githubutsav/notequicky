"use client"

import { useRef, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteHighlight, deleteFavorite, deleteNote, deleteNoteEdit } from "@/app/actions"

export function DeleteButton({ id, type, slug }: { id?: string, slug?: string, type: "highlight" | "favorite" | "note" | "note-edit" }) {
  const [isPending, startTransition] = useTransition()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const handleDelete = () => {
    const item = buttonRef.current?.closest<HTMLElement>("[data-delete-item]")

    if (item) {
      item.style.opacity = "0.45"
      item.style.transform = "translateX(8px) scale(0.99)"
      item.style.pointerEvents = "none"
    }

    startTransition(async () => {
      try {
        if (type === "highlight" && id) {
          await deleteHighlight(id)
          toast.success("Highlight removed")
        } else if (type === "favorite" && id) {
          await deleteFavorite(id)
          toast.success("Favorite removed")
        } else if (type === "note" && id) {
          await deleteNote(id)
          toast.success("Note deleted")
        } else if (type === "note-edit" && slug) {
          await deleteNoteEdit(slug)
          toast.success("Personal edit removed")
        }
        if (item) item.style.display = "none"
        router.refresh()
      } catch (err) {
        if (item) {
          item.style.opacity = ""
          item.style.transform = ""
          item.style.pointerEvents = ""
        }
        toast.error(`Failed to remove ${type}`)
      }
    })
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
      title="Delete"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  )
}

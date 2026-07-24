"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { MessageSquare, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addComment, deleteComment } from "@/app/actions"
import { formatDistanceToNow } from "date-fns"

interface CommentObj {
  id: string
  text: string
  createdAt: Date
  user: {
    name: string | null
    image: string | null
  }
  userId: string
}

interface CommentSectionProps {
  noteSlug: string
  comments: CommentObj[]
}

export function CommentSection({ noteSlug, comments }: CommentSectionProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!session?.user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    startTransition(async () => {
      try {
        await addComment(noteSlug, text)
        setText("")
        toast.success("Comment added")
      } catch {
        toast.error("Failed to add comment")
      }
    })
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteComment(id)
        toast.success("Comment deleted")
      } catch {
        toast.error("Failed to delete comment")
      } finally {
        setDeletingId(null)
      }
    })
  }

  if (!isOpen) {
    return (
      <div className="mt-16 flex justify-center">
        <Button
          variant="outline"
          className="rounded-full text-muted-foreground hover:text-foreground bg-background/50 border-border/50"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="size-4 mr-2" />
          {comments.length > 0
            ? `View ${comments.length} Comment${comments.length === 1 ? "" : "s"}`
            : "Add a Comment"}
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-16 rounded-xl border border-border/50 bg-background/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          Comments ({comments.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-muted-foreground">
          Hide
        </Button>
      </div>

      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              {comment.user.image ? (
                <img src={comment.user.image} alt="" className="size-8 rounded-full border border-border/50" />
              ) : (
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                  {comment.user.name?.charAt(0) || "?"}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.user.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {session?.user?.id === comment.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      title="Delete comment"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add your thoughts..."
          className="w-full resize-none rounded-lg border border-border/60 bg-background/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={3}
          disabled={isPending}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !text.trim()} size="sm">
            {isPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  )
}

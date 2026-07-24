"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { Pencil, X, Save, Loader2, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/markdown"
import { saveNoteEdit, deleteNoteEdit } from "@/app/actions"
import { useHighlightsStore } from "@/lib/stores/highlight-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NoteEditorProps {
  slug: string
  originalContent: string
  /** If the user already has a saved override, pass it here */
  savedContent?: string | null
  defaultIsEditing?: boolean
  isCustomNote?: boolean
  highlights?: {
    id: string
    text: string
    color: string | null
    source?: string | null
    startOffset?: number | null
    endOffset?: number | null
    blockIndex?: number | null
    groupId?: string | null
  }[]
}

const EMPTY_HIGHLIGHTS: any[] = []

export function NoteEditor({ slug, originalContent, savedContent, defaultIsEditing = false, isCustomNote = false, highlights: initialHighlights = EMPTY_HIGHLIGHTS }: NoteEditorProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(defaultIsEditing)
  const [content, setContent] = useState(savedContent ?? originalContent)
  const [draftContent, setDraftContent] = useState(content)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [showCancelAlert, setShowCancelAlert] = useState(false)
  const [showResetAlert, setShowResetAlert] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // ── Drag & Drop / Paste Images into Markdown ─────────────────────
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    if (!cloudName || !apiKey) throw new Error("Missing Cloudinary config")

    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = { timestamp }

    const res = await fetch("/api/sign-cloudinary-params", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paramsToSign }),
    })

    if (!res.ok) throw new Error("Signing failed")
    const { signature } = await res.json()

    const formData = new FormData()
    formData.append("file", file)
    formData.append("api_key", apiKey)
    formData.append("timestamp", String(timestamp))
    formData.append("signature", signature)

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!uploadRes.ok) throw new Error("Upload failed")
    const data = await uploadRes.json()
    return data.secure_url
  }

  const handleImageFiles = async (files: File[], textarea: HTMLTextAreaElement | null) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) return

    for (const file of imageFiles) {
      const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ") || "image"
      const toastId = toast.loading(`Uploading image: ${file.name}...`)

      let imageUrl: string = ""
      try {
        imageUrl = await uploadToCloudinary(file)
        toast.success("Image uploaded to Cloudinary!", { id: toastId })
      } catch (err) {
        console.warn("Cloudinary upload failed, using local data URL fallback", err)
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const raw = (e.target?.result as string) || ""
            resolve(raw.replace(/[\r\n\s]+/g, ""))
          }
          reader.readAsDataURL(file)
        })
        toast.info("Inserted image locally", { id: toastId })
      }

      if (!imageUrl) continue

      const markdownImage = `\n![${alt}](${imageUrl})\n`

      if (textarea) {
        const start = textarea.selectionStart ?? textarea.value.length
        const end = textarea.selectionEnd ?? textarea.value.length
        const currentVal = textarea.value
        const updated = currentVal.substring(0, start) + markdownImage + currentVal.substring(end)
        
        setDraftContent(updated)

        setTimeout(() => {
          textarea.focus()
          const newCursor = start + markdownImage.length
          textarea.setSelectionRange(newCursor, newCursor)
        }, 50)
      } else {
        setDraftContent((prev) => prev + markdownImage)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleImageFiles(Array.from(e.dataTransfer.files), textareaRef.current)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const imageFiles = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"))
      if (imageFiles.length > 0) {
        e.preventDefault()
        void handleImageFiles(imageFiles, textareaRef.current)
      }
    }
  }

  // ── Zustand highlight store ────────────────────────────────────────
  const localHighlights = useHighlightsStore((s) => s.highlights)
  const setHighlights = useHighlightsStore((s) => s.setHighlights)

  // Sync server-fetched highlights into the store on mount / when they change
  useEffect(() => {
    setHighlights(initialHighlights)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialHighlights)])

  if (!session?.user) return null

  const handleEdit = () => {
    setDraftContent(content)
    setIsEditing(true)
    setSaved(false)
  }

  const handleCancel = () => {
    if (content !== draftContent) {
      setShowCancelAlert(true)
    } else {
      setIsEditing(false)
      if (slug === "new") router.back()
    }
  }

  const confirmCancel = () => {
    setDraftContent(content)
    setIsEditing(false)
    setShowCancelAlert(false)
    if (slug === "new") router.back()
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const resultId = await saveNoteEdit(slug, draftContent)
        
        if (slug === "new" && typeof resultId === "string") {
          toast.success("Note created!")
          router.replace(`/notes/${resultId}`)
        } else {
          setContent(draftContent)
          setIsEditing(false)
          setSaved(true)
          router.refresh()
          toast.success("Note saved")
        }
      } catch {
        toast.error("Failed to save note.")
      }
    })
  }

  const handleReset = () => {
    setShowResetAlert(true)
  }

  const confirmReset = () => {
    startTransition(async () => {
      try {
        await deleteNoteEdit(slug)
        setContent(originalContent)
        setDraftContent(originalContent)
        setIsEditing(false)
        setSaved(false)
        setShowResetAlert(false)
        router.refresh()
        toast.success("Note reset to original")
      } catch {
        toast.error("Failed to reset.")
      }
    })
  }

  return (
    <>
      {isEditing ? (
        <div className="flex flex-col gap-4">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">
              {isCustomNote || slug === "new" ? "Editing note" : "Editing your personal version"}
            </span>
            <div className="flex items-center gap-2">
              {!(isCustomNote || slug === "new") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isPending}
                  className="text-muted-foreground gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Reset to original
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
                <X className="size-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="size-3.5 mr-1.5" />
                )}
                Save
              </Button>
            </div>
          </div>

          {/* Split panel */}
          <div className="grid grid-cols-2 gap-4 min-h-[600px]">
            {/* Editor */}
            <div className="flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Markdown</p>
                <span className="text-[10px] text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded">
                  📷 Drag & drop images or paste from clipboard
                </span>
              </div>
              <div className="relative flex flex-1 flex-col">
                <textarea
                  ref={textareaRef}
                  className={`flex-1 resize-none rounded-lg border border-border/60 bg-background/60 p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                    isDragging ? "border-primary border-dashed ring-2 ring-primary/40 bg-primary/5" : ""
                  }`}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                  }}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  spellCheck={false}
                />
                {isDragging && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/85 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-primary flex items-center gap-2">
                      📥 Drop image here to insert into Markdown
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
              <div className="flex-1 overflow-y-auto rounded-lg border border-border/60 bg-background/60 p-4">
                <Markdown content={draftContent} highlights={localHighlights} noteSlug={slug} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {/* View toolbar */}
          <div className="mb-2 flex items-center justify-between">
            {savedContent && !isCustomNote ? (
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                ✏️ Viewing your personal edit
              </span>
            ) : (
              <span />
            )}
            {saved && (
              <span className="text-xs text-green-600 font-medium">✓ Saved!</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="ml-auto gap-1.5"
            >
              <Pencil className="size-3.5" />
              Edit this note
            </Button>
          </div>

          {/* Content */}
          <Markdown content={content} highlights={localHighlights} noteSlug={slug} />
        </div>
      )}

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your unsaved edits?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetAlert} onOpenChange={setShowResetAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to original?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your personal version and reset to the original content? Your edits will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

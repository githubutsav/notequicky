"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createNote(title: string, content: string, folder: string = "Drafts") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  // Input validation
  if (!title?.trim() || title.length > 200) throw new Error("Invalid title")
  if (!content?.trim() || content.length > 100_000) throw new Error("Content too large")

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()

  return await db.note.create({
    data: {
      title: title.trim(),
      content,
      slug,
      folder,
      userId: session.user.id
    }
  })
}

export async function saveHighlight(
  text: string,
  noteSlug: string,
  color?: string,
  startOffset?: number,
  endOffset?: number,
  blockIndex?: number,
  groupId?: string,
  source?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  if (!text?.trim() || text.length > 5000) throw new Error("Invalid text")
  if (!noteSlug?.trim() || noteSlug.length > 200) throw new Error("Invalid slug")

  const hl = await db.highlight.create({
    data: {
      text: text.trim(),
      noteSlug,
      color,
      startOffset,
      endOffset,
      blockIndex,
      groupId,
      source,
      userId: session.user.id
    }
  })
  
  if (noteSlug === "home") {
    revalidatePath("/")
  } else {
    revalidatePath(`/notes/${noteSlug}`)
  }
  
  return hl
}

export async function saveBatchHighlight(
  records: Array<{
    text: string
    noteSlug: string
    color: string
    startOffset?: number
    endOffset?: number
    blockIndex?: number
    groupId?: string
    source?: string
  }>
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")
  if (!records.length) return []

  const created = await db.$transaction(
    records.map((r) =>
      db.highlight.create({
        data: { ...r, userId: session.user!.id! }
      })
    )
  )

  const noteSlug = records[0].noteSlug
  revalidatePath(noteSlug === "home" ? "/" : `/notes/${noteSlug}`)

  return created
}

export async function replaceHighlights(
  previousIds: string[],
  record: {
    text: string
    noteSlug: string
    color: string
    source?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")
  if (!previousIds.length) throw new Error("No highlights to replace")
  if (!record.text?.trim() || record.text.length > 5000) throw new Error("Invalid text")
  if (!record.noteSlug?.trim() || record.noteSlug.length > 200) throw new Error("Invalid slug")

  const created = await db.$transaction(async (tx) => {
    const existing = await tx.highlight.findMany({
      where: {
        id: { in: previousIds },
        noteSlug: record.noteSlug,
        userId: session.user!.id!,
      },
      select: { id: true },
    })

    if (existing.length !== previousIds.length) {
      throw new Error("One or more highlights no longer exist")
    }

    await tx.highlight.deleteMany({
      where: { id: { in: previousIds }, userId: session.user!.id! },
    })

    return tx.highlight.create({
      data: { ...record, userId: session.user!.id! },
    })
  })

  revalidatePath(record.noteSlug === "home" ? "/" : `/notes/${record.noteSlug}`)
  return created
}

export async function saveFavorite(text: string, noteSlug: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  // Input validation
  if (!text?.trim() || text.length > 5000) throw new Error("Invalid text")
  if (!noteSlug?.trim() || noteSlug.length > 200) throw new Error("Invalid slug")

  return await db.favorite.create({
    data: {
      text: text.trim(),
      noteSlug,
      userId: session.user.id
    }
  })
}

export async function saveNoteEdit(slug: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  if (!slug?.trim() || slug.length > 200) throw new Error("Invalid slug")
  if (!content?.trim() || content.length > 500_000) throw new Error("Content too large")

  const titleMatch = content.match(/^#\s+(.*)/m)
  const extractedTitle = titleMatch ? titleMatch[1].trim() : "Untitled Note"

  if (slug === "new") {
    const generatedSlug = extractedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()
    const newNote = await db.note.create({
      data: {
        title: extractedTitle,
        slug: generatedSlug,
        content,
        folder: "Drafts",
        userId: session.user.id,
      },
    })
    return newNote.id
  }

  // Check if it's a custom db.note
  const existingCustom = await db.note.findUnique({
    where: { id: slug },
  })

  if (existingCustom) {
    if (existingCustom.userId !== session.user.id) throw new Error("Unauthorized")
    await db.note.update({
      where: { id: slug },
      data: { title: extractedTitle, content },
    })
    return slug
  }

  await db.noteEdit.upsert({
    where: { slug_userId: { slug, userId: session.user.id } },
    update: { content },
    create: { slug, content, userId: session.user.id },
  })
  
  return null
}

export async function getNoteEdit(slug: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  return await db.noteEdit.findUnique({
    where: { slug_userId: { slug, userId: session.user.id } },
    select: { content: true },
  })
}

export async function deleteNoteEdit(slug: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  await db.noteEdit.deleteMany({
    where: { slug, userId: session.user.id },
  })
}

export async function deleteHighlight(id: string, noteSlug?: string, sourceId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  let hl = await db.highlight.findFirst({
    where: { id, userId: session.user.id },
  })

  // Older rendered highlights may not have the database ID attached to their
  // DOM wrapper. Resolve the saved web-highlighter source as a fallback.
  if (!hl && noteSlug && sourceId) {
    const candidates = await db.highlight.findMany({
      where: { noteSlug, userId: session.user.id, source: { not: null } },
    })
    hl = candidates.find((candidate) => {
      try {
        return JSON.parse(candidate.source!).id === sourceId
      } catch {
        return false
      }
    }) ?? null
  }

  if (!hl || hl.userId !== session.user.id) return false
  
  await db.highlight.delete({
    where: { id },
  })

  if (hl.noteSlug === "home") {
    revalidatePath("/")
  } else {
    revalidatePath(`/notes/${hl.noteSlug}`)
  }

  return { id: hl.id }
}

export async function deleteFavorite(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  await db.favorite.delete({
    where: { id, userId: session.user.id },
  })
}

export async function deleteNote(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  await db.note.delete({
    where: { id, userId: session.user.id },
  })
}

export async function addComment(noteSlug: string, text: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  if (!text?.trim() || text.length > 5000) throw new Error("Invalid text")
  if (!noteSlug?.trim() || noteSlug.length > 200) throw new Error("Invalid slug")

  const comment = await db.comment.create({
    data: {
      text: text.trim(),
      noteSlug,
      userId: session.user.id
    }
  })

  if (noteSlug === "home") {
    revalidatePath("/")
  } else {
    revalidatePath(`/notes/${noteSlug}`)
  }
  return comment
}

export async function deleteComment(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not logged in")

  const comment = await db.comment.findUnique({ where: { id } })
  if (!comment || comment.userId !== session.user.id) return

  await db.comment.delete({
    where: { id }
  })

  if (comment.noteSlug === "home") {
    revalidatePath("/")
  } else {
    revalidatePath(`/notes/${comment.noteSlug}`)
  }
}

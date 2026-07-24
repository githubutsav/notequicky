import "server-only"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { getOrder } from "@/lib/order"
import { slugifyHeading } from "@/lib/utils"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface Heading {
  depth: number
  text: string
  slug: string
}

export interface NoteMeta {
  slug: string
  title: string
  description: string
  date: string
  order: number
  /** Plain-text excerpt used for search */
  searchText: string
}

export interface Note extends NoteMeta {
  content: string
  headings: Heading[]
}



// slugifyHeading is defined in lib/utils.ts so it can also be used by client components
export { slugifyHeading } from "@/lib/utils"

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  const lines = markdown.split("\n")
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = /^(#{2,3})\s+(.+)$/.exec(line)
    if (match) {
      const text = match[2].replace(/[*_`]/g, "").trim()
      headings.push({
        depth: match[1].length,
        text,
        slug: slugifyHeading(text),
      })
    }
  }

  return headings
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseNote(fileName: string): Note {
  const slug = fileName.replace(/\.md$/, "")
  const filePath = path.join(CONTENT_DIR, fileName)
  const raw = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(raw)

  let title = data.title;
  if (!title) {
    const match = /^#\s+(.+)$/m.exec(content);
    title = match ? match[1].trim() : slug;
  }

  let description = data.description;
  if (!description) {
    const plainText = toPlainText(content);
    description = plainText.slice(0, 120).trim();
    if (plainText.length > 120) {
      description += "...";
    }
  }

  let dateStr = "";
  if (data.date) {
    dateStr = new Date(data.date).toISOString();
  } else {
    try {
      const stats = fs.statSync(filePath);
      dateStr = stats.birthtime.toISOString();
    } catch (e) {
      dateStr = new Date().toISOString();
    }
  }

  return {
    slug,
    title,
    description,
    date: dateStr,
    order: getOrder(slug),
    searchText: toPlainText(content).slice(0, 2000),
    content,
    headings: extractHeadings(content),
  }
}

export function getAllNotes(): Note[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  function walkDir(dir: string, baseDir: string): string[] {
    let results: string[] = []
    const list = fs.readdirSync(dir)
    for (const file of list) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat && stat.isDirectory()) {
        results = results.concat(walkDir(fullPath, baseDir))
      } else {
        if (fullPath.endsWith(".md")) {
          let relPath = path.relative(baseDir, fullPath)
          relPath = relPath.split(path.sep).join("/")
          results.push(relPath)
        }
      }
    }
    return results
  }

  return walkDir(CONTENT_DIR, CONTENT_DIR)
    .map(parseNote)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.date < b.date ? 1 : -1
    })
}

export function getNote(slug: string): Note | undefined {
  return getAllNotes().find((n) => n.slug === slug)
}

export function formatDate(iso: string): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export interface DirectoryNode {
  name: string
  path: string
}

export interface DirectoryContents {
  folders: DirectoryNode[]
  notes: Note[]
}

export function getDirectoryContents(folderPath: string): DirectoryContents {
  const allNotes = getAllNotes()
  const folders = new Map<string, DirectoryNode>()
  const notes: Note[] = []

  const targetPrefix = folderPath ? (folderPath + "/") : ""
  const targetDepth = folderPath ? folderPath.split("/").length : 0

  for (const note of allNotes) {
    const isInsideTarget = folderPath === "" || note.slug.startsWith(targetPrefix)
    
    if (isInsideTarget) {
      const slugParts = note.slug.split("/")
      const noteDepth = slugParts.length - 1
      if (noteDepth === targetDepth) {
        notes.push(note)
      } else if (noteDepth > targetDepth) {
        const subfolderName = slugParts[targetDepth]
        const subfolderPath = targetPrefix + subfolderName
        if (!folders.has(subfolderName)) {
          folders.set(subfolderName, { name: subfolderName, path: subfolderPath })
        }
      }
    }
  }

  return {
    folders: Array.from(folders.values()).sort((a, b) => {
      const orderA = getOrder(a.name)
      const orderB = getOrder(b.name)
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    }),
    notes: notes.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.date < b.date ? 1 : -1
    })
  }
}

export function getAllFolders(): string[] {
  const allNotes = getAllNotes()
  const folderPaths = new Set<string>()
  for (const note of allNotes) {
    const parts = note.slug.split("/")
    if (parts.length > 1) {
      let current = ""
      for (let i = 0; i < parts.length - 1; i++) {
        current = current ? `${current}/${parts[i]}` : parts[i]
        folderPaths.add(current)
      }
    }
  }
  return Array.from(folderPaths)
}

export function getNavigationOrder(): Note[] {
  const allNotes = getAllNotes()
  
  type Node = {
    isFolder: boolean
    name: string
    path: string
    order: number
    note?: Note
    children: Record<string, Node>
  }

  const root: Record<string, Node> = {}

  for (const note of allNotes) {
    const parts = note.slug.split("/")
    let currentLevel = root
    let currentPath = ""

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (i === parts.length - 1) {
        currentLevel[part] = {
          isFolder: false,
          name: part,
          path: currentPath,
          order: note.order,
          note: note,
          children: {},
        }
      } else {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            isFolder: true,
            name: part,
            path: currentPath,
            order: getOrder(part),
            children: {},
          }
        }
        currentLevel = currentLevel[part].children
      }
    }
  }

  const convertToArray = (nodeMap: Record<string, Node>): Node[] => {
    const arr = Object.values(nodeMap)
    
    return arr.sort((a, b) => {
      if (a.isFolder === b.isFolder) {
        if (a.order !== b.order) return a.order - b.order
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      }
      return a.isFolder ? -1 : 1
    })
  }

  const flatten = (nodes: Node[]): Note[] => {
    let result: Note[] = []
    for (const node of nodes) {
      if (node.isFolder) {
        const sortedChildren = convertToArray(node.children)
        result = result.concat(flatten(sortedChildren))
      } else if (node.note) {
        result.push(node.note)
      }
    }
    return result
  }

  return flatten(convertToArray(root))
}

export function getAdjacentNotes(slug: string): { prev: Note | null, next: Note | null } {
  const ordered = getNavigationOrder();
  const currentIndex = ordered.findIndex(n => n.slug === slug);
  if (currentIndex === -1) return { prev: null, next: null };
  return {
    prev: currentIndex > 0 ? ordered[currentIndex - 1] : null,
    next: currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null,
  };
}

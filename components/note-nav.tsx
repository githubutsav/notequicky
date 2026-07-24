"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, ChevronDown, Folder, Highlighter, Star, FileText } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { getOrder } from "@/lib/order"

export interface NavNote {
  slug: string
  title: string
  order: number
}

type FileNode = {
  isFolder: false
  name: string
  path: string
  title: string
  order: number
}

type FolderNode = {
  isFolder: true
  name: string
  path: string
  order: number
  children: TreeNode[]
}

type TreeNode = FileNode | FolderNode

function buildTree(notes: NavNote[]): TreeNode[] {
  type BuilderNode = {
    isFolder: boolean
    name: string
    path: string
    order: number
    title?: string
    children: Record<string, BuilderNode>
  }

  const root: Record<string, BuilderNode> = {}

  for (const note of notes) {
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
          title: note.title,
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

  const convertToArray = (nodeMap: Record<string, BuilderNode>): TreeNode[] => {
    const sorted = Object.values(nodeMap).sort((a, b) => {
      if (a.isFolder === b.isFolder) {
        if (a.order !== b.order) return a.order - b.order
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
      }
      return a.isFolder ? -1 : 1
    })

    return sorted.map((node) => {
      if (node.isFolder) {
        return {
          isFolder: true,
          name: node.name,
          path: node.path,
          order: node.order,
          children: convertToArray(node.children),
        }
      } else {
        return {
          isFolder: false,
          name: node.name,
          path: node.path,
          order: node.order,
          title: node.title!,
        }
      }
    })
  }

  return convertToArray(root)
}

function TreeItem({
  node,
  pathname,
  onNavigate,
  level = 0,
}: {
  node: TreeNode
  pathname: string
  onNavigate?: () => void
  level?: number
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (
      node.isFolder &&
      (pathname.includes(`/notes/${node.path}`) ||
        pathname.includes(`/folders/${node.path}`))
    ) {
      setIsOpen(true)
    }
  }, [pathname, node.path, node.isFolder])

  if (node.isFolder) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-accent/60 text-foreground/80 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors text-left"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 opacity-70 shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 opacity-70 shrink-0" />
          <span className="truncate capitalize">{node.name.replace(/-/g, " ")}</span>
        </button>
        {isOpen && (
          <div className="flex flex-col">
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                pathname={pathname}
                onNavigate={onNavigate}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const encodedPath = node.path.split('/').map(encodeURIComponent).join('/')
  const href = `/notes/${encodedPath}`
  const active = pathname === `/notes/${node.path}` // Match decoded path for active state

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex rounded-md py-1.5 pr-2 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-foreground/80 hover:bg-accent/60 hover:text-accent-foreground",
      )}
      style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}
    >
      <span className="truncate">{node.title}</span>
    </Link>
  )
}

const specialFolders = [
  { href: "/my/highlights", label: "Highlights", icon: Highlighter },
  { href: "/my/favorites",  label: "Favorites",  icon: Star },
  { href: "/my/drafts",     label: "My Notes",   icon: FileText },
]

export function NoteNav({
  notes,
  onNavigate,
}: {
  notes: NavNote[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const tree = React.useMemo(() => buildTree(notes), [notes])

  return (
    <nav aria-label="Notes" className="flex flex-col gap-6">
      {/* Special folders — only shown when logged in */}
      {session?.user && (
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground px-2 text-xs font-medium tracking-wide uppercase">
            My Workspace
          </p>
          <div className="flex flex-col mt-1">
            {specialFolders.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  pathname === href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground/80 hover:bg-accent/60 hover:text-accent-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Static notes tree */}
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground px-2 text-xs font-medium tracking-wide uppercase">
          Notes
        </p>
        <div className="flex flex-col mt-1">
          {tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              pathname={pathname}
              onNavigate={onNavigate}
              level={0}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}

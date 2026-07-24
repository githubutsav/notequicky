import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDirectoryContents, getAllFolders } from "@/lib/notes"
import { NoteList } from "@/components/note-list"

export function generateStaticParams() {
  return getAllFolders().map((folder) => ({ slug: folder.split('/') }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const slugStr = slug.join('/')
  return { title: `Folder: ${slugStr}` }
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const contents = getDirectoryContents(slugStr)
  
  if (contents.folders.length === 0 && contents.notes.length === 0) {
    notFound()
  }

  // Generate breadcrumbs
  const breadcrumbs = slug.map((segment, index) => {
    const path = slug.slice(0, index + 1).join('/')
    return { name: segment, path }
  })

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:py-12">
      <div className="flex flex-col gap-2">
        <nav className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.path} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={`/folders/${crumb.path}`}
                className="hover:text-primary transition-colors"
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {slug[slug.length - 1]}
        </h1>
        <p className="text-muted-foreground text-pretty leading-relaxed">
          {contents.folders.length} folder(s), {contents.notes.length} note(s)
        </p>
      </div>

      <NoteList contents={contents} />
    </div>
  )
}

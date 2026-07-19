import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NoteNav } from '@/components/note-nav'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { getAllNotes, getAllTags } from '@/lib/notes'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Field Notes',
    template: '%s · Field Notes',
  },
  description:
    'A personal knowledge base of markdown notes — searchable, tagged, and readable anywhere.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Field Notes',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1b19' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const notes = getAllNotes()
  const tags = getAllTags()

  const navNotes = notes.map(({ slug, title }) => ({ slug, title }))
  const searchNotes = notes.map(
    ({ slug, title, description, tags: noteTags, searchText }) => ({
      slug,
      title,
      description,
      tags: noteTags,
      searchText,
    }),
  )

  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader notes={navNotes} tags={tags} searchNotes={searchNotes} />
          <div className="mx-auto flex w-full max-w-7xl">
            <aside className="border-border/60 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r lg:block">
              <ScrollArea className="h-full px-3 py-6">
                <NoteNav notes={navNotes} tags={tags} />
              </ScrollArea>
            </aside>
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

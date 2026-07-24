import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NoteNav } from '@/components/note-nav'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { AppLayout } from '@/components/app-layout'
import { Providers } from '@/components/session-provider'
import { TextSelectionMenu } from '@/components/text-selection-menu'
import { Toaster } from "@/components/ui/sonner"
import { HighlightModeProvider } from "@/components/highlight-mode-provider"
import { getAllNotes } from '@/lib/notes'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Quicky',
    template: '%s · Quicky',
  },
  description:
    'A personal knowledge base of markdown notes — searchable, tagged, and readable anywhere.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quicky',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1b19' },
  ],
}

import { ProductTour } from "@/components/product-tour"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const notes = getAllNotes()
  const navNotes = notes.map(({ slug, title, order }) => ({ slug, title, order }))
  const searchNotes = notes.map(
    ({ slug, title, description, searchText }) => ({
      slug,
      title,
      description,
      searchText,
    }),
  )

  return (
    <html lang="en" className="bg-background" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <HighlightModeProvider>
              <TextSelectionMenu />
              <ProductTour />
              <AppLayout navNotes={navNotes} searchNotes={searchNotes}>
                {children}
              </AppLayout>
            </HighlightModeProvider>
          </Providers>
        </ThemeProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

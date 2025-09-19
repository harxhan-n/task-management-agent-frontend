import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskFlow AI - Intelligent Task Management',
  description: 'Experience the future of task management with our AI-powered assistant. Create, organize, and track tasks naturally through conversation.',
  keywords: ['TaskFlow AI', 'AI task management', 'intelligent productivity', 'conversational interface', 'real-time collaboration'],
  authors: [{ name: 'TaskFlow AI Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'anoncast',
  description: 'Post anonymously to Farcaster.',
  openGraph: {
    title: 'anoncast',
    description: 'Post anonymously to Farcaster.',
    images: ['/anon.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} antialiased min-h-screen w-full`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}

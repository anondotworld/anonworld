import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { GeistSans } from 'geist/font/sans'
import { ConnectButton } from '@/components/connect-button'
import { Logo } from '@/components/logo'

export const metadata: Metadata = {
  title: 'anoncast',
  description: 'Post anonymously to Farcaster.',
  openGraph: {
    title: 'anoncast',
    description: 'Post anonymously to Farcaster.',
    images: ['/anon.png'],
  },
  other: {
    ['fc:frame']: JSON.stringify({
      version: 'next',
      imageUrl: '/banner.png',
      button: {
        title: 'Post anonymously',
        action: {
          type: 'launch_frame',
          name: 'anoncast',
          url: 'https://anoncast.org',
          splashImageUrl: '/anon.png',
          splashBackgroundColor: '#151515',
        },
      },
    }),
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
        <Providers>
          <div className="flex h-screen flex-col p-4 xl:p-8 max-w-screen-sm mx-auto gap-8">
            <div className="flex items-center justify-between xl:absolute xl:top-0 xl:left-0 xl:right-0 xl:p-8 xl:max-w-screen-xl xl:mx-auto">
              <Logo />
              <ConnectButton />
            </div>
            <div className="z-10">{children}</div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}

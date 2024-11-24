import type { Metadata } from 'next'
// import localFont from "next/font/local";
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { GeistSans } from 'geist/font/sans'
import { ConnectButton } from '@/components/connect-button'

export const metadata: Metadata = {
  title: '$ANON',
  description: 'Post anonymously to Farcaster.',
  openGraph: {
    title: '$ANON',
    description: 'Post anonymously to Farcaster.',
    images: ['/anon.webp'],
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
              <div className="text-lg font-bold flex flex-row items-center font-geist xl:w-64 xl:justify-end">
                <img src="/anon.webp" alt="ANON" className="w-8 h-8 mr-3 rounded-full" />
                <span className="hidden sm:block">anoncast</span>
              </div>
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

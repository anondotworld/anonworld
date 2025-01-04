'use client'

import { createConfig } from 'wagmi'
import { ThemeProvider } from 'next-themes'
import { frameConnector } from '@/lib/connector'
import { Provider, SDKProvider, viemConfig } from '@anonworld/react'

export const config = createConfig({
  ...viemConfig,
  connectors: [frameConnector()],
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
      disableTransitionOnChange
    >
      <Provider wagmiConfig={config}>
        <SDKProvider apiUrl={process.env.NEXT_PUBLIC_API_URL}>{children}</SDKProvider>
      </Provider>
    </ThemeProvider>
  )
}

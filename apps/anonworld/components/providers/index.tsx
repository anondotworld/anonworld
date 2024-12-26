'use client'

import { Provider } from '@anonworld/react'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'
import { ReactNode } from 'react'
import { ThemeProvider } from './theme'
import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
  appName: 'anoncast',
  projectId: '302e299e8d6c292b6aeb9f313321e134',
  chains: [base],
  ssr: true,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Provider wagmiConfig={config}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </Provider>
    </ThemeProvider>
  )
}

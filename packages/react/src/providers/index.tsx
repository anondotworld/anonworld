import { TamaguiProvider, config } from '@anonworld/ui'
import { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ToastProvider } from './toast'
import { ReactNode } from 'react'
export { SDKProvider, useSDK } from './sdk'

const queryClient = new QueryClient()

export function Provider({
  children,
  wagmiConfig,
}: { children: ReactNode; wagmiConfig: any }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme="dark" disableRootThemeClass>
          <ToastProvider>{children}</ToastProvider>
        </TamaguiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

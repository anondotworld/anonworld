import { AnonWorldSDK } from '@anonworld/sdk'
import { createContext, useContext, ReactNode, useMemo } from 'react'
import { AuthProvider } from './auth'
import { CredentialsProvider } from './credentials'

interface SDKContextValue {
  sdk: AnonWorldSDK
  connectWallet?: () => void
  isConnecting: boolean
}

export const SDKContext = createContext<SDKContextValue | undefined>(undefined)

export const SDKProvider = ({
  connectWallet = () => {},
  isConnecting = false,
  children,
  apiUrl,
}: {
  connectWallet?: () => void
  isConnecting?: boolean
  children: ReactNode
  apiUrl?: string
}) => {
  const sdk = useMemo(() => new AnonWorldSDK(apiUrl), [apiUrl])

  return (
    <SDKContext.Provider value={{ sdk, connectWallet, isConnecting }}>
      <AuthProvider sdk={sdk}>
        <CredentialsProvider>{children}</CredentialsProvider>
      </AuthProvider>
    </SDKContext.Provider>
  )
}

export const useSDK = () => {
  const context = useContext(SDKContext)
  if (!context) {
    throw new Error('useSDK must be used within an SDKProvider')
  }
  return context
}

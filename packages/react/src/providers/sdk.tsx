import { AnonWorldSDK } from '@anonworld/sdk'
import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useCredentials } from '../hooks/use-credentials'
import { useAuth } from '../hooks/use-auth'

interface SDKContextValue {
  sdk: AnonWorldSDK
  credentials: ReturnType<typeof useCredentials>
  connectWallet?: () => void
  isConnecting: boolean
  auth: ReturnType<typeof useAuth>
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
  const credentials = useCredentials(sdk)
  const auth = useAuth(sdk)

  return (
    <SDKContext.Provider value={{ sdk, credentials, connectWallet, isConnecting, auth }}>
      {children}
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

'use client'

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { createSiweMessage } from 'viem/siwe'
import { useAccount } from 'wagmi'
import { verifyMessage } from 'viem'

const STORAGE_KEY = 'auth:v0'

type SiweResult = {
  address: `0x${string}`
  message: string
  signature: `0x${string}`
}

interface AuthContextType {
  siwe?: SiweResult
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [siwe, setSiwe] = useState<SiweResult | undefined>()
  const { address } = useAccount()

  const signIn = async (message: string, signature: `0x${string}`) => {
    if (address) {
      const payload = { address, message, signature }
      if (await verifyMessage(payload)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        setSiwe(payload)
        return true
      }
    }

    localStorage.removeItem(STORAGE_KEY)
    setSiwe(undefined)
    return false
  }

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const nonce = Math.random().toString(36).substring(2, 15)
          return nonce
        },

        createMessage: ({ nonce, address, chainId }) => {
          return createSiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in with Ethereum to the app.',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce,
          })
        },

        verify: async ({ message, signature }) => {
          return signIn(message, signature as `0x${string}`)
        },

        signOut: async () => {
          localStorage.removeItem(STORAGE_KEY)
          setSiwe(undefined)
        },
      }),
    []
  )

  useEffect(() => {
    const item = localStorage.getItem(STORAGE_KEY)
    if (item) {
      const payload = JSON.parse(item)
      signIn(payload.message, payload.signature)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ siwe }}>
      <RainbowKitAuthenticationProvider
        adapter={adapter}
        status={siwe ? 'authenticated' : 'unauthenticated'}
      >
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}

'use client'

import { config } from '@/components/providers'
import { sdk } from '@farcaster/frame-sdk'
import { FrameContext } from '@farcaster/frame-sdk'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { verifyMessage } from 'viem'
import { createSiweMessage } from 'viem/siwe'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'

const STORAGE_KEY = 'auth:v0'

type SiweResult = {
  address: `0x${string}`
  message: string
  signature: `0x${string}`
}

interface AuthContextType {
  siwe?: SiweResult
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  context?: FrameContext
  isLoaded: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [siwe, setSiwe] = useState<SiweResult | undefined>()
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<FrameContext>()

  const { address, isConnected } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context)
      sdk.actions.ready()
    }
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true)
      load().then(signIn)
    }
  }, [isSDKLoaded])

  const signIn = async () => {
    const siwe = localStorage.getItem(STORAGE_KEY)
    if (siwe) {
      const payload = JSON.parse(siwe) as SiweResult
      if (payload.address === address) {
        if (await verifyMessage(payload)) {
          setSiwe(payload)
          return
        }
      }
    }

    if (!isConnected) {
      await connectAsync({ connector: config.connectors[0] })
    }

    if (!address) {
      throw new Error('No address found')
    }

    const message = createSiweMessage({
      domain: window.location.host,
      address: address as `0x${string}`,
      statement: 'Sign in with Ethereum to the app.',
      uri: window.location.origin,
      version: '1',
      chainId: 8453,
      nonce: Math.random().toString(36).substring(2, 15),
    })

    const signature = await signMessageAsync({ message })
    const payload = { address, message, signature }
    if (await verifyMessage(payload)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setSiwe(payload)
      return
    }

    localStorage.removeItem(STORAGE_KEY)
    setSiwe(undefined)
  }

  const signOut = async () => {
    await disconnectAsync()
    localStorage.removeItem(STORAGE_KEY)
    setSiwe(undefined)
  }

  useEffect(() => {
    if (address) {
      signIn()
    }
  }, [address])

  return (
    <AuthContext.Provider
      value={{ siwe, signIn, signOut, context, isLoaded: isSDKLoaded }}
    >
      {children}
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

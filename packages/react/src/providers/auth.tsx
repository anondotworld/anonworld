'use client'

import { createContext, useContext } from 'react'
import { AnonWorldSDK } from '@anonworld/sdk'
import { WebAuthnP256 } from 'ox'
import { useEffect, useMemo, useState } from 'react'
import { hexToBytes } from 'viem'

export const LOCAL_AUTH_KEY = 'anon:auth:v1'

const getInitialAuth = () => {
  const stored = localStorage.getItem(LOCAL_AUTH_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      localStorage.removeItem(LOCAL_AUTH_KEY)
      return null
    }
  }
  return null
}

type AuthContextType = {
  authenticate: () => Promise<void>
  logout: () => void
  passkeyId?: string
  token?: string
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({
  children,
  sdk,
}: {
  children: React.ReactNode
  sdk: AnonWorldSDK
}) => {
  const initialAuth = getInitialAuth()
  if (initialAuth) {
    sdk.setToken(initialAuth.token)
  }

  const [auth, setAuth] = useState<{ passkeyId: string; token: string } | null>(
    initialAuth
  )
  const [isLoading, setIsLoading] = useState(false)

  const nonce = useMemo(() => crypto.randomUUID(), [])

  useEffect(() => {
    if (auth) {
      sdk.setToken(auth.token)
    }
  }, [auth])

  const getChallenge = async () => {
    const response = await sdk.getPasskeyChallenge(nonce)
    if (!response.data?.challenge) {
      throw new Error('Failed to get passkey challenge')
    }
    return response.data.challenge
  }

  const loginFromPasskey = async () => {
    try {
      const challenge = await getChallenge()
      const { raw, signature, metadata } = await WebAuthnP256.sign({ challenge })
      const response = await sdk.authenticatePasskey({
        nonce,
        raw,
        signature: {
          r: `0x${signature.r.toString(16)}`,
          s: `0x${signature.s.toString(16)}`,
          yParity: signature.yParity,
        },
        metadata,
      })
      if (!response.data) {
        throw new Error('Failed to authenticate passkey')
      }
      return { passkeyId: raw.id, token: response.data.token }
    } catch (error) {
      if ((error as Error).name === 'WebAuthnP256.CredentialRequestFailedError') {
        return null
      }
      throw error
    }
  }

  const createPasskey = async () => {
    const challenge = await getChallenge()
    const { id, publicKey } = await WebAuthnP256.createCredential({
      name: 'anon.world',
      challenge: hexToBytes(challenge),
    })
    const response = await sdk.createPasskey({
      nonce,
      id,
      publicKey: {
        prefix: publicKey.prefix,
        x: `0x${publicKey.x.toString(16)}`,
        y: `0x${publicKey.y.toString(16)}`,
      },
    })
    if (!response.data) {
      throw new Error('Failed to create passkey')
    }
    return { passkeyId: id, token: response.data.token }
  }

  const authenticate = async () => {
    if (auth) return

    setIsLoading(true)
    try {
      let auth = await loginFromPasskey()
      if (!auth) {
        auth = await createPasskey()
      }
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(auth))
      setAuth(auth)
    } catch (error) {
      console.error('Failed to login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(LOCAL_AUTH_KEY)
    setAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        authenticate,
        logout,
        passkeyId: auth?.passkeyId,
        token: auth?.token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

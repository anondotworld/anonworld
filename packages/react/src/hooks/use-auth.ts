import { AnonWorldSDK } from '@anonworld/sdk'
import { WebAuthnP256 } from 'ox'
import { useEffect, useMemo, useState } from 'react'
import { hexToBytes } from 'viem'
import { useVaults } from './use-vaults'

const LOCAL_STORAGE_KEY = 'anon:auth:v1'

export const useAuth = (sdk: AnonWorldSDK) => {
  const [passkeyId, setPasskeyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const nonce = useMemo(() => crypto.randomUUID(), [])

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      setPasskeyId(stored)
    }
  }, [])

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
      return raw.id
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
    return id
  }

  const authenticate = async () => {
    if (passkeyId) return

    setIsLoading(true)
    try {
      let passkeyId = await loginFromPasskey()
      if (!passkeyId) {
        passkeyId = await createPasskey()
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, passkeyId)
      setPasskeyId(passkeyId)
    } catch (error) {
      console.error('Failed to login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setPasskeyId(null)
  }

  return { authenticate, logout, passkeyId, isLoading }
}

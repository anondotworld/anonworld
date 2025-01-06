'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSignMessage } from 'wagmi'
import { CredentialType, CredentialWithId } from '@anonworld/common'
import { useSDK } from './sdk'
import { useVaults } from '../hooks/use-vaults'
import { CredentialArgsTypeMap, CredentialsManager } from '@anonworld/credentials'
import { hashMessage } from 'viem'

const LOCAL_STORAGE_KEY = 'anon:credentials:v1'

const fixCredential = (credential: CredentialWithId) => {
  const [type, ...rest] = credential.credential_id.split(':')
  return {
    ...credential,
    type,
    credential_id: `${type.toUpperCase()}:${rest.join(':')}`,
  }
}

const getInitialCredentials = () => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored).map(fixCredential)
    } catch (error) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return []
    }
  }
  return []
}

type CredentialsContextType = {
  credentials: CredentialWithId[]
  delete: (id: string) => Promise<void>
  get: (id: string) => CredentialWithId | undefined
  add: (type: CredentialType, args: any, parentId?: string) => Promise<CredentialWithId>
  addToVault: (vaultId: string, credentialId: string) => Promise<void>
  removeFromVault: (vaultId: string, credentialId: string) => Promise<void>
}

const CredentialsContext = createContext<CredentialsContextType | null>(null)

export const CredentialsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const manager = useMemo(() => new CredentialsManager(), [])

  const { sdk } = useSDK()
  const [credentials, setCredentials] = useState<CredentialWithId[]>(
    getInitialCredentials()
  )
  const { signMessageAsync } = useSignMessage()
  const { data: vaults } = useVaults()

  useEffect(() => {
    if (vaults) {
      const missingCredentials = vaults.flatMap((vault) =>
        vault.credentials.filter((cred) => !credentials.some((c) => c.id === cred.id))
      )
      setCredentials((prev) => [...prev, ...missingCredentials])
    }
  }, [vaults])

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(credentials.map(fixCredential))
    )
  }, [credentials])

  const addCredential = async <T extends CredentialType>(
    type: T,
    args: CredentialArgsTypeMap[T],
    parentId?: string
  ) => {
    const verifier = manager.getVerifier(type)

    const { input, message } = await verifier.buildInput(args)

    let inputSignature = input.signature
    let inputMessageHash = input.messageHash
    if (!inputSignature) {
      inputSignature = await signMessageAsync({ message })
      inputMessageHash = hashMessage(message)
    }

    const proof = await verifier.generateProof({
      ...input,
      signature: inputSignature,
      messageHash: inputMessageHash,
    })

    const credential = await sdk.createCredential({
      ...proof,
      parentId,
    })

    if (credential.error) {
      throw new Error(credential.error.message)
    }

    if (parentId) {
      setCredentials((prev) =>
        prev.map((cred) => (cred.id === parentId ? credential.data : cred))
      )
    } else {
      setCredentials((prev) => [...prev, credential.data])
    }
    return credential.data
  }

  const deleteCredential = async (id: string) => {
    const credential = credentials.find((cred) => cred.id === id)
    if (credential?.vault_id) {
      await sdk.removeFromVault(credential.vault_id, id)
    }
    setCredentials((prev) => prev.filter((cred) => cred.id !== id))
  }

  const getCredential = (id: string) => {
    return credentials.find((cred) => cred.id === id)
  }

  const addToVault = async (vaultId: string, credentialId: string) => {
    await sdk.addToVault(vaultId, credentialId)
    setCredentials((prev) =>
      prev.map((cred) =>
        cred.id === credentialId ? { ...cred, vault_id: vaultId } : cred
      )
    )
  }

  const removeFromVault = async (vaultId: string, credentialId: string) => {
    await sdk.removeFromVault(vaultId, credentialId)
    setCredentials((prev) =>
      prev.map((cred) => (cred.id === credentialId ? { ...cred, vault_id: null } : cred))
    )
  }

  return (
    <CredentialsContext.Provider
      value={{
        credentials,
        delete: deleteCredential,
        get: getCredential,
        add: addCredential,
        addToVault,
        removeFromVault,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  )
}

export const useCredentials = () => {
  const context = useContext(CredentialsContext)
  if (!context) {
    throw new Error('useCredentials must be used within an CredentialsProvider')
  }
  return context
}

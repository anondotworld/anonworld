'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useConfig, useSignMessage } from 'wagmi'
import { concat, hashMessage, keccak256, pad, toHex } from 'viem'
import { CredentialWithId, getChain } from '@anonworld/common'
import { getBlock, getProof } from 'wagmi/actions'
import { useSDK } from './sdk'
import { useVaults } from '../hooks/use-vaults'

const LOCAL_STORAGE_KEY = 'anon:credentials:v1'

const getInitialCredentials = () => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
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
  add: (args: {
    chainId: number
    tokenAddress: string
    verifiedBalance: bigint
    parentId?: string
  }) => Promise<CredentialWithId>
  addToVault: (vaultId: string, credentialId: string) => Promise<void>
  removeFromVault: (vaultId: string, credentialId: string) => Promise<void>
}

const CredentialsContext = createContext<CredentialsContextType | null>(null)

export const CredentialsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { sdk, connectWallet } = useSDK()
  const [credentials, setCredentials] = useState<CredentialWithId[]>(
    getInitialCredentials()
  )
  const { signMessageAsync } = useSignMessage()
  const { address } = useAccount()
  const config = useConfig()
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(credentials))
  }, [credentials])

  const addERC20Balance = async (args: {
    chainId: number
    tokenAddress: string
    verifiedBalance: bigint
    parentId?: string
  }) => {
    if (!address) {
      connectWallet?.()
      throw new Error('No address connected')
    }

    const chain = getChain(args.chainId)

    const response = await sdk.getBalanceStorageSlot(args.chainId, args.tokenAddress)
    if (!response.data) {
      throw new Error('Failed to find balance storage slot')
    }

    const balanceSlot = response.data.slot
    const balanceSlotHex = pad(toHex(balanceSlot))
    const storageKey = keccak256(concat([pad(address), balanceSlotHex]))
    const block = await chain.client.getBlock()
    const proof = await chain.client.getProof({
      address: args.tokenAddress as `0x${string}`,
      storageKeys: [storageKey],
      blockNumber: block.number,
    })

    const message = JSON.stringify({
      chainId: args.chainId,
      blockNumber: block.number.toString(),
      storageHash: proof.storageHash,
      tokenAddress: args.tokenAddress,
      balanceSlot: balanceSlot,
      balance: args.verifiedBalance.toString(),
    })
    const messageHash = hashMessage(message)
    const signature = await signMessageAsync({ message })

    const credential = await sdk.verifyERC20Balance({
      address,
      signature,
      messageHash,
      storageHash: proof.storageHash,
      storageProof: proof.storageProof,
      chainId: args.chainId,
      blockNumber: block.number,
      tokenAddress: args.tokenAddress as `0x${string}`,
      balanceSlot: balanceSlotHex,
      verifiedBalance: args.verifiedBalance,
      blockTimestamp: block.timestamp,
      parentId: args.parentId,
    })

    if (credential.error) {
      throw new Error(credential.error.message)
    }

    return credential.data
  }

  const addCredential = async (args: {
    chainId: number
    tokenAddress: string
    verifiedBalance: bigint
    parentId?: string
  }) => {
    const credential = await addERC20Balance(args)
    if (args.parentId) {
      setCredentials((prev) =>
        prev.map((cred) => (cred.id === args.parentId ? credential : cred))
      )
    } else {
      setCredentials((prev) => [...prev, credential])
    }
    return credential
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

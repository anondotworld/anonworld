import { createContext, useContext, useEffect, useState } from 'react'
import { ContractType, CredentialType, StorageType } from '@anonworld/common'
import { useCredentials, useSDK } from '../../../../../providers'
import { useAccount } from 'wagmi'

interface NewERC721CredentialContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  connectWallet: () => void
  isConnecting: boolean
  tokenId: { chainId: number; address: string } | undefined
  setTokenId: (token?: { chainId: number; address: string }) => void
  handleAddCredential: () => void
  isLoading: boolean
  error: string | undefined
}

const NewERC721CredentialContext = createContext<NewERC721CredentialContextValue | null>(
  null
)

export function NewERC721CredentialProvider({
  children,
  initialTokenId,
  initialBalance,
  isOpen,
  setIsOpen,
}: {
  children: React.ReactNode
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const { connectWallet, isConnecting } = useSDK()
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [tokenId, setTokenId] = useState<
    { chainId: number; address: string } | undefined
  >(initialTokenId)
  const { address } = useAccount()
  const { add } = useCredentials()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const { sdk } = useSDK()

  const handleConnectWallet = () => {
    if (!connectWallet) return
    setIsOpen(false)
    setIsConnectingWallet(true)
    connectWallet()
  }

  useEffect(() => {
    if (isConnectingWallet && !isConnecting) {
      setIsConnectingWallet(false)
      setIsOpen(true)
    }
  }, [isConnecting])

  useEffect(() => {
    if (isOpen) {
      if (initialTokenId) {
        setTokenId(initialTokenId)
      }
    }
  }, [isOpen, initialTokenId, initialBalance])

  const handleAddCredential = async () => {
    if (!tokenId) return
    try {
      setIsLoading(true)

      if (!address) {
        throw new Error('No address connected')
      }

      const response = await sdk.getStorageSlot(
        tokenId.chainId,
        tokenId.address,
        ContractType.ERC721,
        StorageType.BALANCE
      )
      if (!response.data) {
        throw new Error('Failed to find balance storage slot')
      }

      await add(CredentialType.ERC721_BALANCE, {
        address,
        chainId: tokenId.chainId,
        tokenAddress: tokenId.address as `0x${string}`,
        verifiedBalance: BigInt(1),
        balanceSlot: response.data.slot,
      })

      setIsLoading(false)
      setIsOpen(false)
    } catch (e) {
      setError((e as Error).message ?? 'Failed to add credential')
      setIsLoading(false)
    }
  }

  return (
    <NewERC721CredentialContext.Provider
      value={{
        isOpen,
        setIsOpen,
        connectWallet: handleConnectWallet,
        isConnecting: isConnectingWallet,
        tokenId,
        setTokenId,
        handleAddCredential,
        isLoading,
        error,
      }}
    >
      {children}
    </NewERC721CredentialContext.Provider>
  )
}

export function useNewERC721Credential() {
  const context = useContext(NewERC721CredentialContext)
  if (!context) {
    throw new Error(
      'useNewERC721Credential must be used within a NewERC721CredentialProvider'
    )
  }
  return context
}

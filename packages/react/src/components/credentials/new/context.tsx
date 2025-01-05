import { createContext, useContext, useEffect, useState } from 'react'
import { ContractType, CredentialType, StorageType } from '@anonworld/common'
import { useCredentials, useSDK } from '../../../providers'
import { parseUnits } from 'viem'
import { useAccount } from 'wagmi'

interface NewCredentialContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  credentialType: CredentialType
  setCredentialType: (credentialType: CredentialType) => void
  connectWallet: () => void
  isConnecting: boolean
  tokenId: { chainId: number; address: string } | undefined
  setTokenId: (token?: { chainId: number; address: string }) => void
  balance: number
  setBalance: (balance: number) => void
  maxBalance: number
  setMaxBalance: (maxBalance: number) => void
  decimals: number
  setDecimals: (decimals: number) => void
  handleAddCredential: () => void
  isLoading: boolean
  error: string | undefined
}

const NewCredentialContext = createContext<NewCredentialContextValue | null>(null)

export function NewCredentialProvider({
  children,
  initialTokenId,
  initialBalance,
}: {
  children: React.ReactNode
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { connectWallet, isConnecting } = useSDK()
  const [credentialType, setCredentialType] = useState<CredentialType>(
    CredentialType.ERC20_BALANCE
  )
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [tokenId, setTokenId] = useState<
    { chainId: number; address: string } | undefined
  >(initialTokenId)
  const [balance, setBalance] = useState<number>(initialBalance ?? 0)
  const [maxBalance, setMaxBalance] = useState<number>(0)
  const [decimals, setDecimals] = useState<number>(18)
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
      if (initialBalance) {
        setBalance(initialBalance)
      }
    }
  }, [isOpen, initialTokenId, initialBalance])

  useEffect(() => {
    if (credentialType === CredentialType.ERC20_BALANCE) {
      setTokenId(undefined)
      setBalance(0)
      setDecimals(18)
    } else if (credentialType === CredentialType.ERC721_BALANCE) {
      setTokenId(undefined)
      setBalance(1)
      setDecimals(0)
    }
  }, [credentialType])

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
        credentialType === CredentialType.ERC20_BALANCE
          ? ContractType.ERC20
          : ContractType.ERC721,
        StorageType.BALANCE
      )
      if (!response.data) {
        throw new Error('Failed to find balance storage slot')
      }

      await add(credentialType, {
        address,
        chainId: tokenId.chainId,
        tokenAddress: tokenId.address as `0x${string}`,
        verifiedBalance: parseUnits(balance.toString(), decimals),
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
    <NewCredentialContext.Provider
      value={{
        isOpen,
        setIsOpen,
        connectWallet: handleConnectWallet,
        credentialType,
        setCredentialType,
        isConnecting: isConnectingWallet,
        tokenId,
        setTokenId,
        balance,
        setBalance,
        maxBalance,
        setMaxBalance,
        decimals,
        setDecimals,
        handleAddCredential,
        isLoading,
        error,
      }}
    >
      {children}
    </NewCredentialContext.Provider>
  )
}

export function useNewCredential() {
  const context = useContext(NewCredentialContext)
  if (!context) {
    throw new Error('useNewCredential must be used within a NewCredentialProvider')
  }
  return context
}

import { createContext, useContext, useEffect, useState } from 'react'
import { ContractType, CredentialType, StorageType } from '@anonworld/common'
import { useCredentials, useSDK } from '../../../../../providers'
import { parseUnits } from 'viem'
import { useAccount } from 'wagmi'

interface NewERC20CredentialContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
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

const NewERC20CredentialContext = createContext<NewERC20CredentialContextValue | null>(
  null
)

export function NewERC20CredentialProvider({
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
        ContractType.ERC20,
        StorageType.BALANCE
      )
      if (!response.data) {
        throw new Error('Failed to find balance storage slot')
      }

      await add(CredentialType.ERC20_BALANCE, {
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
    <NewERC20CredentialContext.Provider
      value={{
        isOpen,
        setIsOpen,
        connectWallet: handleConnectWallet,
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
    </NewERC20CredentialContext.Provider>
  )
}

export function useNewERC20Credential() {
  const context = useContext(NewERC20CredentialContext)
  if (!context) {
    throw new Error(
      'useNewERC20Credential must be used within a NewERC20CredentialProvider'
    )
  }
  return context
}

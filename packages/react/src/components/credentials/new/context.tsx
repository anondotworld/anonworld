import { createContext, useContext, useEffect, useState } from 'react'
import { CredentialType } from '@anonworld/common'
import { useSDK } from '../../../providers'

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
